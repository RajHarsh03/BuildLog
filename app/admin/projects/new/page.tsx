import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 font-mono-code text-mono-code text-on-surface-variant mb-2"
        >
          <Link className="hover:text-primary transition-colors" href="/admin/projects">
            Projects
          </Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-semibold">New</span>
        </nav>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight flex items-center gap-2">
          <Icon name="rocket_launch" size={26} />
          New project
        </h1>
      </div>

      <ProjectForm />
    </div>
  );
}
