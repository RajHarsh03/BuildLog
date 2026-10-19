import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { AuthorChip } from "@/components/blog/AuthorChip";
import { Comments } from "@/components/blog/Comments";
import { renderMdx } from "@/lib/mdx/render";
import { getProjectBySlug } from "@/lib/content/projects";
import { absoluteUrl, formatDate, prettifySlug } from "@/lib/utils";

export const revalidate = 60;

/** Prerender every project at build time (DB-tolerant). */
export async function generateStaticParams() {
  try {
    const { getAllProjectSlugs } = await import("@/lib/content/projects");
    const slugs = await getAllProjectSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return []; // New slugs still render on demand and get cached (dynamicParams).
  }
}

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
  const url = absoluteUrl(`/projects/${project.slug}`);

  // Live Demo + GitHub: equal-width pair (matching grid tracks), content-sized.
  // Rendered top-right on desktop (status row) and below the chips on mobile.
  const actionButtons = (
    <>
      {project.liveUrl && (
        <a
          className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-primary-container text-on-primary-container font-mono-code text-[11px] sm:text-label-md font-bold rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap"
          href={project.liveUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span>Live Demo</span>
          <Icon name="arrow_outward" size={14} />
        </a>
      )}
      {project.githubUrl && (
        <a
          className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-surface-container-lowest text-on-surface font-mono-code text-[11px] sm:text-label-md font-bold rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap"
          href={project.githubUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Icon name="code" size={14} />
          <span>GitHub</span>
        </a>
      )}
    </>
  );
  const hasActions = Boolean(project.liveUrl || project.githubUrl);

  return (
    <div className="w-full px-5 sm:px-8 pt-8">
      <div className="flex flex-col w-full">
        {/* Header */}
        <header className="w-full pb-8 mb-10 border-b-2 border-on-surface space-y-6">
          <Breadcrumbs
            items={[{ label: "Projects", href: "/projects" }, { label: prettifySlug(project.slug) }]}
          />

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} label={project.status} size="sm" />
            {project.featured && (
              <span className="font-mono-code text-label-sm text-primary font-bold ml-auto sm:ml-2 md:ml-0">
                Featured Build
              </span>
            )}
            {/* Desktop: actions sit top-right, aligned with the status row */}
            {hasActions && (
              <div className="hidden md:inline-grid grid-cols-2 gap-3 ml-auto">
                {actionButtons}
              </div>
            )}
          </div>

          <h1 className="font-display text-[36px] leading-[44px] sm:text-display-mobile md:text-display text-on-surface tracking-tight">
            {project.name}
          </h1>
          <p className="font-body-lg text-[16px] leading-[26px] sm:text-body-lg text-on-surface-variant max-w-3xl">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Same label glyph treatment as the article tags row */}
            <span className="inline-flex items-center justify-center w-7 h-7 text-on-surface-variant">
              <Icon name="label" size={25} />
            </span>
            {project.technologies.map((tech) => (
              <Link
                key={tech}
                className="font-mono-code text-label-sm px-2.5 py-1 bg-surface-container text-on-surface rounded border-2 border-on-surface shadow-[1px_1px_0px_0px_var(--color-ink)] font-bold hover:text-primary hover:border-primary transition-colors"
                href={`/projects?tech=${encodeURIComponent(tech)}`}
              >
                {tech}
              </Link>
            ))}
          </div>

          {/* Mobile/tablet only: Live Demo + GitHub fill the screen width in two equal tracks */}
          {hasActions && (
            <div className="grid grid-cols-2 gap-1.5 sm:gap-3 md:hidden">
              {actionButtons}
            </div>
          )}

          <div className="font-mono-code text-label-sm text-on-surface-variant">
            Published {formatDate(project.publishedAt ?? project.createdAt)}
            {project.updatedAt !== (project.publishedAt ?? project.createdAt) && (
              <> • Last updated {formatDate(project.updatedAt)}</>
            )}
          </div>
        </header>

        {/* Body: sticky TOC rail + prose, same layout contract as articles. */}
        {rendered ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
            <aside className="hidden lg:block lg:col-span-4 self-start sticky top-28 space-y-6">
              {rendered.toc.length > 0 && <TableOfContents items={rendered.toc} />}
              <AuthorChip url={url} title={project.name} />
            </aside>
            <article className="mdx-content lg:col-span-8 max-w-[720px] lg:max-w-none w-full text-on-surface">
              {/* Cover sits inside the prose measure so it reads as a figure. */}
              {project.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={project.name} src={project.image} />
              )}
              {rendered.content}
            </article>
          </div>
        ) : (
          <>
            {project.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={project.name}
                className="w-full mb-10 rounded-lg border-2 border-on-surface shadow-[6px_6px_0px_0px_var(--color-ink)]"
                src={project.image}
              />
            )}
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
          </>
        )}

        {/* Mini-bio below the case study on mobile/tablet (sidebar is desktop-only) */}
        <div className="lg:hidden mt-10">
          <AuthorChip url={url} title={project.name} />
        </div>

        {/* Same MongoDB-backed comments as articles; readers sign in with GitHub */}
        <Comments postId={project._id} />
      </div>
    </div>
  );
}
