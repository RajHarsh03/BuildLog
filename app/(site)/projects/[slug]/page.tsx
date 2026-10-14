import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { renderMdx } from "@/lib/mdx/render";
import { getProjectBySlug } from "@/lib/content/projects";
import { absoluteUrl, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug).catch(() => null);
  if (!project) return { title: "Project not found" };

  const url = absoluteUrl(`/projects/${project.slug}`);
  return {
    title: project.name,
    description: project.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: project.name,
      description: project.description,
      url,
      ...(project.image ? { images: [{ url: project.image }] } : {}),
    },
    twitter: {
      card: project.image ? "summary_large_image" : "summary",
      title: project.name,
      description: project.description,
    },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug).catch(() => null);
  if (!project) notFound();

  const rendered = project.content ? await renderMdx(project.content) : null;

  return (
    <div className="w-full px-5 sm:px-8 py-8">
      <div className="flex flex-col w-full">
        {/* Header */}
        <header className="w-full pb-8 mb-10 border-b-2 border-on-surface space-y-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 font-mono-code text-mono-code text-on-surface-variant"
          >
            <Link className="hover:text-primary transition-colors flex items-center gap-1" href="/">
              <Icon name="home" size={16} />
              <span>Home</span>
            </Link>
            <span className="text-outline">/</span>
            <Link className="hover:text-primary transition-colors" href="/projects">
              Projects
            </Link>
            <span className="text-outline">/</span>
            <span className="text-on-surface font-semibold">{project.name}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} label={project.status} />
            {project.featured && (
              <span className="font-mono-code text-label-sm text-primary font-bold">
                Featured Build
              </span>
            )}
          </div>

          <h1 className="font-display text-display-mobile md:text-display text-on-surface tracking-tight">
            {project.name}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="font-mono-code text-label-sm px-2.5 py-1 bg-surface-container text-on-surface rounded border-2 border-on-surface shadow-[1px_1px_0px_0px_var(--color-ink)] font-bold"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {project.liveUrl && (
              <a
                className="px-4 py-2.5 bg-primary-container text-on-primary-container font-mono-code text-label-md font-bold rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-2"
                href={project.liveUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>Live Demo</span>
                <Icon name="arrow_outward" size={16} />
              </a>
            )}
            {project.githubUrl && (
              <a
                className="px-4 py-2.5 bg-surface-container-lowest text-on-surface font-mono-code text-label-md font-bold rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-2"
                href={project.githubUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon name="code" size={16} />
                <span>GitHub</span>
              </a>
            )}
          </div>

          <div className="font-mono-code text-label-sm text-on-surface-variant">
            Last updated {formatDate(project.updatedAt)}
          </div>
        </header>

        {/* Body */}
        {project.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={project.name}
            className="w-full mb-10 rounded-lg border-2 border-on-surface shadow-[6px_6px_0px_0px_var(--color-ink)] object-cover"
            src={project.image}
          />
        )}

        {rendered ? (
          <article className="mdx-content max-w-[720px] w-full text-on-surface">
            {rendered.content}
          </article>
        ) : (
          <div className="bg-surface-container-lowest border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] rounded-lg p-8 text-center">
            <p className="font-headline-md text-headline-md text-on-surface font-semibold">
              Case study coming soon.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              A full write-up for {project.name} is in progress. In the meantime, explore the stack
              and links above.
            </p>
            <Link
              className="inline-flex items-center gap-1.5 mt-4 font-mono-code text-label-md font-bold text-primary hover:text-on-surface transition-colors"
              href="/projects"
            >
              <span>Back to all projects</span>
              <Icon name="arrow_forward" size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
