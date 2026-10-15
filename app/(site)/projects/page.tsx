import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ProjectsBrowser } from "@/components/projects/ProjectsBrowser";
import { getProjects, getProjectStatusCounts } from "@/lib/content/projects";
import { absoluteUrl, author } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "A curated archive of side projects, developer tools, open-source libraries, and experiments. Built from scratch with an emphasis on runtime efficiency and production resilience.";

export const metadata: Metadata = {
  title: "Projects",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/projects") },
  openGraph: {
    title: "Projects - BuildLog",
    description: DESCRIPTION,
    url: absoluteUrl("/projects"),
    type: "website",
  },
};

export default async function ProjectsPage() {
  const [projects, counts] = await Promise.all([
    getProjects("all").catch(() => []),
    getProjectStatusCounts().catch(() => ({ all: 0, active: 0, shipped: 0, archived: 0 })),
  ]);

  return (
    <div className="w-full px-5 sm:px-8 py-8">
      <div className="flex flex-col w-full">
        {/* Breadcrumb & editorial header */}
        <header className="w-full mb-10">
          <Breadcrumbs items={[{ label: "Projects" }]} className="mb-2" />
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6">
            <div className="max-w-3xl">
              <h1 className="font-display text-display-mobile md:text-display text-on-surface tracking-tight mb-1">
                Things I&apos;ve Built
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                A curated archive of side projects, developer tools, open-source libraries, and
                experiments built by {author.name}. All crafted from scratch with an emphasis on
                runtime efficiency, tactile interfaces, and production resilience.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-low p-2 rounded-lg shrink-0 border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)]">
              <div className="flex flex-col px-3 py-1 bg-surface-container-lowest rounded border border-on-surface">
                <span className="font-mono-code text-label-sm text-on-surface-variant uppercase">
                  Projects
                </span>
                <span className="font-mono-code text-headline-sm font-bold text-on-surface">
                  {counts.all}
                </span>
              </div>
              <div className="flex flex-col px-3 py-1 bg-surface-container-lowest rounded border border-on-surface">
                <span className="font-mono-code text-label-sm text-on-surface-variant uppercase">
                  Active
                </span>
                <span className="font-mono-code text-headline-sm font-bold text-primary">
                  {counts.active}
                </span>
              </div>
            </div>
          </div>

          <ProjectsBrowser projects={projects} counts={counts} />
        </header>

        {/* Bottom CTA: collaboration invitation */}
        <section className="w-full bg-surface-container-lowest border-2 border-on-surface shadow-[6px_6px_0px_0px_var(--color-ink)] rounded-lg p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-fixed text-on-primary-fixed font-mono-code text-label-sm font-bold rounded border border-on-surface">
                <Icon name="handshake" size={16} />
                <span>OPEN FOR COLLABORATION</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold">
                Have an idea or want to collaborate on an open-source tool?
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                I&apos;m always keen to pair-program on high-performance infrastructure, developer
                ergonomics, Rust CLI tools, or distributed state systems. If you have an RFC or a
                broken build, let&apos;s look at the logs together.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                className="w-full px-5 py-3.5 bg-primary-container text-on-primary-container font-mono-code text-label-md font-bold rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2 text-center"
                href="/about"
              >
                <Icon name="mail" size={18} />
                <span>Get in Touch</span>
              </Link>
              <Link
                className="w-full px-5 py-3.5 bg-surface-container text-on-surface font-mono-code text-label-md font-bold rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2 text-center"
                href="/articles"
              >
                <Icon name="article" size={18} />
                <span>Read the Journal</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
