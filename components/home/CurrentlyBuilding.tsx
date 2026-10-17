import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ProjectSummary } from "@/types/project";

/** "Currently Building" spotlight card driven by the latest featured active project. */
export function CurrentlyBuilding({ project }: { project: ProjectSummary }) {
  return (
    <section className="w-full">
      <div className="bg-mint-soft border-2 border-on-surface shadow-[6px_6px_0px_0px_var(--color-ink)] rounded-lg p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all">
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-nowrap items-center justify-between gap-2 sm:flex-wrap sm:justify-start sm:gap-2.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 whitespace-nowrap bg-surface-container-lowest border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] rounded sm:gap-2 sm:px-3 sm:py-1">
              <span className="relative flex h-1.5 w-1.5 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-mint sm:h-2.5 sm:w-2.5" />
              </span>
              <span className="font-mono-code text-[10px] uppercase font-bold tracking-wider text-on-surface sm:font-label-sm sm:text-label-sm">
                CURRENTLY BUILDING
              </span>
            </div>
            <span className="sm:hidden">
              <StatusBadge status={project.status} label={project.status} size="sm" />
            </span>
            <span className="hidden sm:inline-flex font-mono-code text-xs font-bold px-2 py-1 bg-surface-container-lowest text-mint-ink border-2 border-on-surface rounded">
              {project.status.toUpperCase()}
            </span>
          </div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight sm:font-headline-lg sm:text-headline-lg">
            {project.name}
          </h2>
          <p className="font-body-md text-body-sm text-on-surface max-w-2xl leading-relaxed sm:text-body-md">
            {project.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {project.technologies.slice(0, 6).map((tech) => (
              <span
                key={tech}
                className="font-label-sm text-label-sm px-2.5 py-1 bg-surface-container-lowest border-2 border-on-surface rounded shadow-[1px_1px_0px_0px_var(--color-ink)] font-bold"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-56">
          <Link
            className="w-full text-center px-4 py-3 bg-on-surface text-surface font-mono-code text-mono-code font-bold uppercase tracking-wider border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2"
            href={`/projects/${project.slug}`}
          >
            <span>View Project Specs</span>
            <Icon name="arrow_forward" size={18} />
          </Link>
          <Link
            className="hidden sm:flex w-full text-center px-4 py-3 bg-surface-container-lowest text-on-surface font-mono-code text-mono-code font-bold uppercase tracking-wider border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all items-center justify-center gap-2"
            href="/projects"
          >
            <Icon name="history" size={18} />
            <span>All Projects</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
