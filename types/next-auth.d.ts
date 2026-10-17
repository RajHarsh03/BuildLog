import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /** Extend the session so `session.user.id` is always available. */
  interface Session {
    user: {
      id: string;
      /** GitHub username, captured at OAuth sign-in; used for comment profile links. */
      githubLogin?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    githubLogin?: string;
  }
}
