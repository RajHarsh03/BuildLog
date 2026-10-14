import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getProjectById } from "@/lib/content/projects";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Params }) {
  const { id } = await params;
  const project = await getProjectById(id).catch(() => null);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 font-mono-code text-mono-code text-on-surface-variant mb-2"
          >
            <Link className="hover:text-primary transition-colors" href="/admin/projects">
              Projects
            </Link>
            <span className="text-outline">/</span>
            <span className="text-on-surface font-semibold truncate">Edit</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight flex items-center gap-3">
            <Icon name="rocket_launch" size={26} />
            <span className="truncate">{project.name}</span>
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={project.status} />
            <span className="font-mono-code text-label-sm text-on-surface-variant">
              /{project.slug}
            </span>
          </div>
        </div>

        <Link
          href={`/projects/${project.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest text-on-surface font-mono-code text-label-sm font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all self-start"
        >
          <Icon name="open_in_new" size={16} />
          View live
        </Link>
      </div>

      <ProjectForm project={project} />
    </div>
  );
}
