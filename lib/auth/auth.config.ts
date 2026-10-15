import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config. This MUST NOT import the MongoDB adapter or any
 * Node-only dependency, because it is reused by `middleware.ts` (Edge runtime).
 * The full config (adapter + GitHub provider) lives in `./auth.ts`.
 */
export const authConfig = {
  // Trust the host header (required behind proxies like Vercel, and avoids
  // UntrustedHost errors in the Edge middleware when AUTH_URL is not set).
  trustHost: true,
  // Where unauthenticated users are sent when they hit a protected route.
  pages: {
    signIn: "/login",
  },
  // Providers are declared in auth.ts (GitHub needs Node runtime + secrets).
  providers: [],
  callbacks: {
    /**
     * Gate the `/admin` area. The middleware matcher only targets `/admin/:path*`,
     * so the public site never runs this and works without auth configured.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      if (isAdminRoute) {
        if (isLoggedIn) return true;
        // Not logged in -> redirect to sign-in with an error flag.
        return Response.redirect(
          new URL("/login?error=Unauthorized", nextUrl),
        );
      }

      // Logged-in users have no business on /login; send them to the dashboard.
      if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
