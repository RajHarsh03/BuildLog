import { auth } from "@/lib/auth/auth";
import type { Session } from "next-auth";

/**
 * Server-side authorization gate for the admin area and all mutating API routes.
 *
 * Returns the active session, or `null` when the caller is not allowed. When
 * `ADMIN_EMAIL` is set, only that GitHub account may access the CMS — a simple
 * single-admin allowlist. When it is unset, any authenticated user is allowed
 * (fine for a personal site, but set ADMIN_EMAIL for real deployments).
 */
export async function requireAdmin(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user) return null;

  const allowList = process.env.ADMIN_EMAIL;
  if (allowList) {
    const email = session.user.email;
    if (!email || email.toLowerCase() !== allowList.toLowerCase()) {
      return null;
    }
  }

  return session;
}
