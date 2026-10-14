import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ProjectSummary } from "@/types/project";
import { cn } from "@/lib/utils";

function TechTags({ technologies }: { technologies: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {technologies.map((tech) => (
        <span
          key={tech}
          className="px-2.5 py-1 bg-surface-container text-on-surface font-mono-code text-label-sm rounded border border-[var(--color-ink)]"
        >
          {tech}
        </span>
      ))}
    </div>
  );
}

function ProjectLinks({ project }: { project: ProjectSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-primary-container text-on-primary-container font-mono-code text-label-md font-bold rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-2"
        >
          <span>Live Demo</span>
          <Icon name="arrow_outward" size={16} />
        </a>
      )}
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-surface-container text-on-surface hover:bg-surface-variant font-mono-code text-label-md font-bold rounded border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] transition-all flex items-center gap-2"
        >
          <Icon name="code" size={16} />
          <span>GitHub</span>
        </a>
      )}
      <Link
        href={`/projects/${project.slug}`}
        className="px-4 py-2.5 text-primary hover:text-on-surface font-mono-code text-label-md font-bold transition-all flex items-center gap-1.5 ml-auto"
      >
        <span>Case Study</span>
        <Icon name="arrow_forward" size={18} />
      </Link>
    </div>
  );
}

export function ProjectCard({
  project,
  featured = false,
}: {
  project: ProjectSummary;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <article
        className={cn(
          "md:col-span-12 bg-surface-container-lowest border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] rounded-lg overflow-hidden transition-all",
          "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)]",
        )}
        data-category={project.status}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={project.status} label={project.status} />
                {project.featured && (
                  <span className="font-mono-code text-label-sm text-primary font-bold">
                    Featured Build
                  </span>
                )}
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
                {project.name}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {project.description}
              </p>
              <TechTags technologies={project.technologies} />
            </div>
            <ProjectLinks project={project} />
          </div>

          <div className="lg:col-span-5 bg-[var(--color-ink)] p-6 sm:p-8 flex flex-col justify-between text-[#F4F4F5] font-mono-code border-t-2 lg:border-t-0 lg:border-l-2 border-on-surface">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-dot-red" />
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="w-3 h-3 rounded-full bg-mint" />
                  <span className="text-label-sm text-[#A1A1AA] ml-2">{project.slug}</span>
                </div>
                <span className="text-label-sm text-tertiary-fixed font-bold">READY</span>
              </div>
              <div className="text-label-sm space-y-2">
                <p className="text-[#A1A1AA]">$ buildlog inspect --project={project.slug}</p>
                <p className="text-tertiary-fixed">✓ stack parsed: {project.technologies.length} technologies</p>
                <p className="text-secondary-fixed">→ status: {project.status}</p>
                <div className="bg-[#27272A] p-2.5 rounded text-surface-bright space-y-1 my-2">
                  <span className="text-primary-fixed font-bold">[INFO] Highlights</span>
                  <p className="text-label-sm text-[#A1A1AA]">{project.description.slice(0, 90)}...</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 rounded p-3 border-2 border-[#27272A]">
              <div className="flex items-center justify-between text-label-sm mb-2">
                <span className="flex items-center gap-1.5 text-tertiary-fixed font-bold">
                  <Icon name="check_circle" size={16} />
                  Build healthy
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "md:col-span-6 bg-surface-container-lowest border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] rounded-lg p-6 sm:p-8 flex flex-col justify-between gap-6 transition-all",
        "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)]",
      )}
      data-category={project.status}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={project.status} label={project.status} />
          <span className="font-mono-code text-label-sm text-on-surface-variant">
            {project.technologies[0] ?? "Project"}
          </span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
          {project.name}
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          {project.description}
        </p>
        <TechTags technologies={project.technologies} />
      </div>
      <ProjectLinks project={project} />
    </article>
  );
}
