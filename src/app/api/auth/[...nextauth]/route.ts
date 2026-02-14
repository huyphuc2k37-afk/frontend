import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = (user as any).role || "reader";
        if (account?.provider === "credentials") {
          token.sub = user.id;
        }
      }
      // For Google login, fetch role from backend if not set
      if (!token.role && token.email) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-sync-secret": process.env.NEXTAUTH_SECRET || "",
            },
            body: JSON.stringify({ email: token.email, name: token.name, image: token.picture }),
          });
          const data = await res.json();
          if (data.user?.role) token.role = data.user.role;
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role || "reader";
      }
      // Create a JWT token that the frontend can send to the backend
      (session as any).accessToken = jwt.sign(
        {
          sub: token.sub,
          email: token.email,
          name: token.name,
          picture: token.picture,
        },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: "7d" }
      );
      return session;
    },
  },
});

export { handler as GET, handler as POST };
