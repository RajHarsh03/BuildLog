import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

/**
 * Protects the CMS. Uses the edge-safe config (no adapter / DB), so it can run
 * in the Edge runtime. The matcher is intentionally limited to `/admin/*` — the
 * public site and `/login` never invoke this, which means the site still builds
 * and runs even when GitHub OAuth / AUTH_SECRET are not configured.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
