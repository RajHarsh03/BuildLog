"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { ProjectSummary, ProjectStatus } from "@/types/project";
import { cn } from "@/lib/utils";

interface ProjectsBrowserProps {
  projects: ProjectSummary[];
  counts: Record<string, number>;
  /** Tech preset from /projects?tech=X - set by clickable case-study chips. */
  initialTech?: string;
}

const FILTERS: { key: ProjectStatus | "all"; label: string; short: string; dot?: string }[] = [
  { key: "all", label: "All Projects", short: "All" },
  { key: "active", label: "Active", short: "Active", dot: "bg-tertiary" },
  { key: "shipped", label: "Shipped", short: "Shipped", dot: "bg-secondary-container" },
  { key: "archived", label: "Archived / Learned", short: "Archived", dot: "bg-outline" },
];

export function ProjectsBrowser({ projects, counts, initialTech }: ProjectsBrowserProps) {
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [tech, setTech] = useState(initialTech ?? "");

  // /projects?tech=A -> ?tech=B keeps this client tree mounted; resync.
  useEffect(() => setTech(initialTech ?? ""), [initialTech]);

  const term = tech.trim().toLowerCase();
  const visible = projects.filter(
    (p) =>
      (filter === "all" || p.status === filter) &&
      (!term || p.technologies.some((t) => t.toLowerCase().includes(term))),
  );

  return (
    <>
      <div className="pt-4 space-y-3 lg:flex lg:items-center lg:justify-between lg:gap-4 lg:space-y-0">
        {/* Mobile: tidy 2x2 grid of equal chips; desktop: inline row as before */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap items-center" role="tablist">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "w-full sm:w-auto px-2 sm:px-4 py-1.5 sm:py-2 font-mono-code text-[11px] sm:text-label-md rounded border-2 border-on-surface transition-all flex items-center justify-center gap-1.5 sm:gap-2",
                  active
                    ? "bg-on-surface text-surface-container-lowest shadow-[3px_3px_0px_0px_var(--color-ink)]"
                    : "bg-surface-container-lowest text-on-surface hover:bg-surface-container shadow-[2px_2px_0px_0px_var(--color-ink)]",
                )}
              >
                {f.dot && <span className={cn("w-2 h-2 rounded-full shrink-0", f.dot)} />}
                <span className="truncate sm:whitespace-nowrap">
                  <span className="sm:hidden">{f.short}</span>
                  <span className="hidden sm:inline">{f.label}</span>
                </span>
                <span
                  className={cn(
                    "text-[10px] sm:text-label-sm font-bold",
                    active ? "text-surface-container-lowest/70" : "text-on-surface-variant",
                  )}
                >
                  {counts[f.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        <div className="font-mono-code text-[10px] sm:text-label-sm text-on-surface-variant flex items-center gap-1.5 sm:gap-2">
          <Icon name="tune" size={14} className="text-tertiary shrink-0" />
          <span>
            Filter applied:{" "}
            <span className="font-bold text-on-surface">
              {filter === "all" ? "None" : filter[0].toUpperCase() + filter.slice(1)} (Showing{" "}
              {visible.length})
            </span>
          </span>
          {term && (
            <button
              type="button"
              onClick={() => setTech("")}
              aria-label={`Clear tech filter ${tech}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-fixed text-on-primary-fixed border-2 border-on-surface rounded font-bold whitespace-nowrap hover:text-primary transition-colors"
            >
              <Icon name="label" size={12} />
              {tech}
              <Icon name="close" size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-10">
        {visible.length > 0 ? (
          visible.map((project, i) => (
            <ProjectCard key={project._id} project={project} featured={i === 0 && filter === "all"} />
          ))
        ) : (
          <p className="md:col-span-12 font-body-md text-body-md text-on-surface-variant">
            No projects in this category yet.
          </p>
        )}
      </div>
    </>
  );
}
