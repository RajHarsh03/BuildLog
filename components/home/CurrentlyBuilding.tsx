import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import type { ProjectSummary } from "@/types/project";

/** "Currently Building" spotlight card driven by the latest featured active project. */
export function CurrentlyBuilding({ project }: { project: ProjectSummary }) {
  return (
    <section className="w-full">
      <div className="bg-mint-soft border-2 border-on-surface shadow-[6px_6px_0px_0px_var(--color-ink)] rounded-lg p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all">
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-lowest border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] rounded">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-mint" />
              </span>
              <span className="font-label-sm text-label-sm uppercase font-bold tracking-wider text-on-surface">
                CURRENTLY BUILDING
              </span>
            </div>
            <span className="font-mono-code text-xs font-bold px-2 py-1 bg-surface-container-lowest text-mint-ink border-2 border-on-surface rounded">
              {project.status.toUpperCase()}
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            {project.name}
          </h2>
          <p className="font-body-md text-body-md text-on-surface max-w-2xl leading-relaxed">
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
            className="w-full text-center px-4 py-3 bg-surface-container-lowest text-on-surface font-mono-code text-mono-code font-bold uppercase tracking-wider border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2"
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
