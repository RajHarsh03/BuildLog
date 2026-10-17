import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { AboutForm } from "@/components/admin/AboutForm";
import { getAboutContent, DEFAULT_ABOUT } from "@/lib/content/about";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  // Fall back to defaults if the DB is briefly unavailable; saving re-seeds.
  const about = await getAboutContent().catch(() => ({
    _id: "",
    ...DEFAULT_ABOUT,
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs
        homeLabel="Dashboard"
        homeHref="/admin"
        items={[{ label: "About" }]}
      />
      <div>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight">
          About
        </h1>
      </div>

      <AboutForm initial={about} />
    </div>
  );
}
