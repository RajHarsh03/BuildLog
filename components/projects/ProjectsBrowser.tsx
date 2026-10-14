"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { ProjectSummary, ProjectStatus } from "@/types/project";
import { cn } from "@/lib/utils";

interface ProjectsBrowserProps {
  projects: ProjectSummary[];
  counts: Record<string, number>;
}

const FILTERS: { key: ProjectStatus | "all"; label: string; dot?: string }[] = [
  { key: "all", label: "All Projects" },
  { key: "active", label: "Active", dot: "bg-tertiary" },
  { key: "shipped", label: "Shipped", dot: "bg-secondary-container" },
  { key: "archived", label: "Archived / Learned", dot: "bg-outline" },
];

export function ProjectsBrowser({ projects, counts }: ProjectsBrowserProps) {
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const visible = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <div className="flex flex-wrap items-center gap-2" role="tablist">
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
                  "px-4 py-2 font-mono-code text-label-md rounded border-2 border-on-surface transition-all flex items-center gap-2",
                  active
                    ? "bg-on-surface text-surface-container-lowest shadow-[3px_3px_0px_0px_var(--color-ink)]"
                    : "bg-surface-container-lowest text-on-surface hover:bg-surface-container shadow-[2px_2px_0px_0px_var(--color-ink)]",
                )}
              >
                {f.dot && <span className={cn("w-2 h-2 rounded-full", f.dot)} />}
                <span>{f.label}</span>
                <span
                  className={cn(
                    "text-label-sm font-bold",
                    active ? "text-surface-container-lowest/70" : "text-on-surface-variant",
                  )}
                >
                  {counts[f.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        <div className="font-mono-code text-label-sm text-on-surface-variant flex items-center gap-2">
          <Icon name="tune" size={16} className="text-tertiary" />
          <span>
            Filter applied:{" "}
            <span className="font-bold text-on-surface">
              {filter === "all" ? "None" : filter[0].toUpperCase() + filter.slice(1)} (Showing{" "}
              {visible.length})
            </span>
          </span>
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
