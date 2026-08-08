import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { SignJWT } from "jose";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const JWT_API_SECRET = process.env.JWT_API_SECRET || process.env.NEXTAUTH_SECRET;
const AUTH_SYNC_SECRET = process.env.AUTH_SYNC_SECRET || process.env.NEXTAUTH_SECRET;

/**
 * Normalize Gmail addresses to prevent dot-trick abuse.
 * Gmail ignores dots and everything after + in the local part.
 */
function normalizeEmail(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split("@");
  if (!local || !domain) return email.toLowerCase().trim();
  if (domain === "gmail.com" || domain === "googlemail.com") {
    const cleaned = local.replace(/\./g, "").replace(/\+.*$/, "");
    return `${cleaned}@gmail.com`;
  }
  return `${local}@${domain}`;
}

if (!JWT_API_SECRET || !AUTH_SYNC_SECRET) {
  throw new Error("Missing auth secrets: set JWT_API_SECRET and AUTH_SYNC_SECRET (or NEXTAUTH_SECRET fallback)");
}

console.log("[NextAuth init]", {
  hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  googleIdPrefix: process.env.GOOGLE_CLIENT_ID?.slice(0, 12),
  nextauthUrl: process.env.NEXTAUTH_URL,
  apiBaseUrl: API_BASE_URL,
});

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "select_account", access_type: "offline", response_type: "code" } },
      checks: ["state"],
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Đăng nhập thất bại");
          }

          // Return user object for NextAuth
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.image,
            role: data.user.role || "reader",
          };
        } catch (error: any) {
          throw new Error(error.message || "Đăng nhập thất bại");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  // Cookies chỉ set Secure flag khi chạy production (HTTPS).
  // Trong dev HTTP, secure=true làm browser không gửi cookie → session fail.
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: { httpOnly: true, sameSite: "lax", path: "/", maxAge: 900, secure: process.env.NODE_ENV === "production" },
    },
    state: {
      name: "next-auth.state",
      options: { httpOnly: true, sameSite: "lax", path: "/", maxAge: 900, secure: process.env.NODE_ENV === "production" },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[NextAuth signIn]", {
        provider: account?.provider,
        email: user?.email,
        hasAccount: !!account,
        hasProfile: !!profile,
        accountError: (account as any)?.error,
        accountErrorDescription: (account as any)?.error_description,
      });
      // Block banned emails on Google sign-in
      if (account?.provider === "google" && user.email) {
        const normalizedEmail = normalizeEmail(user.email);
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-sync-secret": AUTH_SYNC_SECRET!,
            },
            body: JSON.stringify({ email: normalizedEmail, name: user.name, image: user.image }),
          });
          if (res.status === 403) {
            // Forward the backend's reason code so the UI can show a specific message.
            let code = "banned";
            try {
              const data = await res.json();
              if (data?.code) code = String(data.code).toLowerCase();
              console.warn("[NextAuth signIn] backend 403", { code, email: normalizedEmail });
            } catch {
              // ignore JSON parse errors — keep generic code
            }
            return `/login?error=${encodeURIComponent(code)}`;
          }
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              (user as any).id = data.user.id;
              (user as any).role = data.user.role;
            }
          }
          // Backend returned non-200 non-403 (e.g. 500 from old code, or env mismatch).
          // Allow login to proceed — user will be created on the fly.
          // This is a safety net: Google OAuth creates the user session regardless.
          // The user won't have a DB role until the backend is updated, but the site works.
          console.warn("[NextAuth signIn] backend sync returned non-success, allowing through", {
            status: res.status,
            email: normalizedEmail,
          });
        } catch (err) {
          // Network error — allow sign-in but log the error
          console.error("[NextAuth] signIn sync network error:", err);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // IMPORTANT: Role is intentionally NOT stored in the JWT.
      //
      // Why: JWT cookies last 7 days and NextAuth reads `role` straight from
      // the cookie on every page load. If the DB role changes (admin promotes
      // a user, author upgrades, etc.) the UI keeps showing the OLD role until
      // the user logs out and back in, because the cookie is still valid.
      //
      // Instead we only persist the stable identifiers (sub/email/name/picture)
      // in the JWT. The role is fetched fresh from /api/profile by
      // UserProfileContext, which keeps the header, dropdown, and admin pages
      // in sync with the DB immediately after a role change.
      if (user) {
        token.email = user.email ? normalizeEmail(user.email) : user.email;
        token.name = user.name;
        token.picture = user.image;
        if (account?.provider === "credentials") {
          token.sub = user.id;
        }
        if (account?.provider === "google" && (user as any).id) {
          token.sub = (user as any).id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      // Create a JWT token that the frontend can send to the backend
      const secret = new TextEncoder().encode(JWT_API_SECRET);
      (session as any).accessToken = await new SignJWT({
        sub: token.sub,
        email: token.email,
        name: token.name,
        picture: token.picture,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(secret);
      return session;
    },
  },
});

export { handler as GET, handler as POST };
