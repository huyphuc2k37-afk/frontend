import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
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
