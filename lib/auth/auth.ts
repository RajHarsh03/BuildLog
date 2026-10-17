import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db/mongo-client";
import { authConfig } from "@/lib/auth/auth.config";

/**
 * Full Auth.js v5 configuration (Node runtime).
 *
 * We keep the MongoDB adapter (persisting users/accounts) but force the JWT
 * session strategy. JWT sessions are required so the Edge middleware can read
 * the session without a database round-trip.
 *
 * A development-only fallback secret lets `npm run dev` work before AUTH_SECRET
 * is set. In production the real AUTH_SECRET must be provided (see .env.example).
 */
const secret =
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV === "production"
    ? undefined
    : "buildlog-insecure-development-secret");

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret,
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user, profile }) {
      if (user) token.sub = user.id ?? token.sub;
      // GitHub's raw OAuth profile carries the username; keep it for profile links.
      const login = (profile as { login?: string } | undefined)?.login;
      if (login) token.githubLogin = login;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.githubLogin) session.user.githubLogin = String(token.githubLogin);
      }
      return session;
    },
  },
});
