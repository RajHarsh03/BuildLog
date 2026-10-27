import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s - Admin" },
  robots: { index: false, follow: false },
};

/**
 * Admin shell. The middleware already guards `/admin/*`; this second check
 * (defense-in-depth) also enforces the optional ADMIN_EMAIL allowlist and
 * provides the signed-in user to the nav.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // One session read serves both the gate and the nav - a second auth()
  // call serialized another round-trip in front of every admin navigation.
  const session = await requireAdmin();
  if (!session) redirect("/login?error=Unauthorized");

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <AdminNav userName={session.user?.name} userImage={session.user?.image} />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
