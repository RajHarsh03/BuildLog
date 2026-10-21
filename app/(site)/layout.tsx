import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BackToTop } from "@/components/shared/BackToTop";
import { getFeaturedProject } from "@/lib/content/projects";

// The nav's active-page highlight depends on the real request URL. Vercel's
// build-time prerender of "/" bakes it as inactive (usePathname is unreliable
// during static generation), so render the shell per-request. Data reads stay
// fast: content helpers are unstable_cache'd and the footer/header are cheap.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Header chip spotlights the featured project; wording follows its status
  // ("Now building" only while the project is still active).
  let nowBuilding = { name: "AI Code Reviewer", status: "active" as string };
  try {
    const project = await getFeaturedProject();
    if (project) nowBuilding = { name: project.name, status: project.status };
  } catch {
    // Public site must still render if the DB is unavailable.
  }

  return (
    <>
      <SiteHeader nowBuilding={nowBuilding.name} shipped={nowBuilding.status === "shipped"} />
      {/* Fixed header (h-20) + compact mobile nav row; offset content accordingly.
          overflow-x-clip ensures no page element can widen the document past
          the viewport (which would desync viewport-anchored fixed chrome). */}
      <main className="w-full pt-[132px] md:pt-20 pb-16 bg-background flex-1 overflow-x-clip">{children}</main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
