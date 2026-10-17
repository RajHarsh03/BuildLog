import { Icon } from "@/components/shared/Icon";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          className="mb-2"
          homeLabel="Dashboard"
          homeHref="/admin"
          items={[{ label: "Projects", href: "/admin/projects" }, { label: "New" }]}
        />
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight flex items-center gap-2">
          <Icon name="rocket_launch" size={26} />
          New project
        </h1>
      </div>

      <ProjectForm />
    </div>
  );
}
