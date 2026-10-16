import { Icon } from "@/components/shared/Icon";
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
      <div>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight flex items-center gap-2">
          <Icon name="person" size={24} />
          About page
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Edit the public About page: intro paragraph, journey milestones and the
          skills toolbox.
        </p>
      </div>

      <AboutForm initial={about} />
    </div>
  );
}
