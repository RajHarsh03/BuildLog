import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProjectRowActions } from "@/components/admin/ProjectRowActions";
import { getAllProjectsAdmin } from "@/lib/content/projects";
import { cn, formatDate } from "@/lib/utils";
import type { ProjectStatus } from "@/types/project";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

const FILTERS: { key: ProjectStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "shipped", label: "Shipped" },
  { key: "archived", label: "Archived" },
];

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = await searchParams;
  const active = (status ?? "all") as ProjectStatus | "all";

  const projects = await getAllProjectsAdmin().catch(() => []);
  const counts = projects.reduce<Record<string, number>>((acc, p) => {
    acc.all = (acc.all ?? 0) + 1;
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});
  const visible =
    active === "all" ? projects : projects.filter((p) => p.status === active);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight">
            Projects
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {counts.all ?? 0} total • {counts.active ?? 0} active •{" "}
            {counts.shipped ?? 0} shipped
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-container text-on-primary font-mono-code text-label-md font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all self-start"
        >
          <Icon name="add" size={18} />
          <span>New project</span>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = active === f.key;
          const href =
            f.key === "all" ? "/admin/projects" : `/admin/projects?status=${f.key}`;
          return (
            <Link
              key={f.key}
              href={href}
              className={cn(
                "px-3 py-1.5 font-mono-code text-label-sm font-bold uppercase tracking-wider rounded border-2 transition-all",
                isActive
                  ? "bg-on-surface text-surface border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)]"
                  : "bg-surface-container-lowest text-on-surface-variant border-on-surface hover:text-on-surface",
              )}
            >
              {f.label}
              <span className="ml-1.5 opacity-70">{counts[f.key] ?? 0}</span>
            </Link>
          );
        })}
      </div>

      {/* List */}
      <div className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] overflow-hidden">
        {visible.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="inbox" size={40} className="text-on-surface-variant mx-auto" />
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">
              No projects in this view.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-container-high">
            {visible.map((project) => (
              <li
                key={project._id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-container-low transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate">
                      {project.name}
                    </h2>
                    {project.featured && (
                      <Icon name="star" fill size={16} className="text-[#92400E] shrink-0" />
                    )}
                  </div>
                  <div className="font-mono-code text-label-sm text-on-surface-variant mt-1 truncate">
                    {project.technologies.slice(0, 4).join(" · ") || "-"}
                    <span className="text-outline"> • </span>
                    Updated {formatDate(project.updatedAt)}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={project.status} />
                  <ProjectRowActions
                    id={project._id}
                    status={project.status}
                    featured={project.featured}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
