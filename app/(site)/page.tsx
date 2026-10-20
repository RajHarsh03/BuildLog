import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { CurrentlyBuilding } from "@/components/home/CurrentlyBuilding";
import { TypingStatus } from "@/components/home/TypingStatus";
import { FeaturedArticle } from "@/components/blog/FeaturedArticle";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { getFeaturedPost, getLatestPosts, getPostStats } from "@/lib/content/posts";
import { getFeaturedProject, getProjects } from "@/lib/content/projects";
import { author } from "@/lib/utils";

// Statically generated + edge-cached; admin publish/star refreshes it instantly
// via revalidateTag, and this bounds staleness as a safety net.
export const revalidate = 60;

export default async function HomePage() {
  // Public site must render even if the DB is unavailable; degrade gracefully.
  const [featured, latest, stats, project, allProjects] = await Promise.all([
    getFeaturedPost().catch(() => null),
    getLatestPosts(4).catch(() => []),
    getPostStats().catch(() => ({ total: 0, published: 0, drafts: 0 })),
    getFeaturedProject().catch(() => null),
    getProjects("all").catch(() => []),
  ]);

  // Featured gets its own hero card; the grid shows up to 3 of the rest.
  // A lone leftover beside the hero looks stranded, so with exactly one
  // non-featured post the spotlight stays alone. Two cards split the row
  // evenly (md:grid-cols-2); three fill the three-track grid.
  const remaining = (featured ? latest.filter((p) => p._id !== featured._id) : latest).slice(0, 3);
  const gridPosts = featured && remaining.length === 1 ? [] : remaining;
  // Recent projects strip: skip the one already showcased in "Currently Building".
  // Max 2; a lone card fills the row, a pair splits it evenly.
  const recentProjects = allProjects
    .filter((p) => !project || p._id !== project._id)
    .slice(0, 2);
  const projectSpan = recentProjects.length === 1 ? "md:col-span-12" : "md:col-span-6";

  return (
    <div className="w-full px-5 sm:px-8 pt-8 overflow-x-clip">
      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-12 sm:space-y-16">
        {/* SECTION 1: EDITORIAL HERO & WORKBENCH */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          <div className="lg:col-span-7 min-w-0 flex flex-col items-start pt-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-lowest border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] rounded">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-bold">
                Personal Dev Journal
              </span>
            </div>
            <h1 className="font-display text-display-mobile md:text-display font-[650] leading-tight tracking-tight text-on-surface">
              Building things.
              <br />
              <span className="relative inline-block mt-1">
                <span className="relative z-10">Learning along the way.</span>
                <span className="absolute inset-x-0 bottom-1.5 h-4 bg-secondary-fixed opacity-70 -rotate-1 rounded-sm -z-0" />
              </span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant w-full max-w-[38rem] leading-relaxed">
              I write about software engineering, distributed systems, side projects, and the hard
              lessons learned while shipping code in production.
            </p>
            <div className="flex flex-nowrap items-center gap-2 sm:gap-4 pt-2 w-full sm:w-auto">
              <Link
                className="flex-1 sm:flex-none justify-center whitespace-nowrap px-2 sm:px-6 sm:py-3 py-2.5 text-[10px] sm:text-mono-code bg-primary-container text-on-primary font-mono-code font-bold uppercase tracking-wide sm:tracking-wider border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all inline-flex items-center gap-1.5 sm:gap-2"
                href="/articles"
              >
                <span>Read Articles</span>
                <Icon name="arrow_forward" size={16} />
              </Link>
              <Link
                className="flex-1 sm:flex-none justify-center whitespace-nowrap px-2 sm:px-6 sm:py-3 py-2.5 text-[10px] sm:text-mono-code bg-surface-container-lowest text-on-surface font-mono-code font-bold uppercase tracking-wide sm:tracking-wider border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all inline-flex items-center gap-1.5 sm:gap-2"
                href="/projects"
              >
                <span>View Projects</span>
                <Icon name="terminal" size={16} />
              </Link>
            </div>
            <div className="hidden md:flex pt-4 border-t-2 border-on-surface w-full max-w-xl flex-wrap items-center gap-y-2 gap-x-4 font-mono-code text-mono-code text-on-surface-variant">
              <div className="flex items-center gap-1.5 font-bold text-on-surface">
                <span className="w-1.5 h-1.5 bg-primary-container rounded-full" />
                <span>{stats.published} Articles Published</span>
              </div>
              <span className="text-outline-variant">•</span>
              <div className="flex items-center gap-1.5 font-bold text-on-surface">
                <span className="w-1.5 h-1.5 bg-secondary-container rounded-full" />
                <span>Open Source Tools</span>
              </div>
              <span className="text-outline-variant">•</span>
              <div className="flex items-center gap-1.5 font-bold text-on-surface">
                <span className="w-1.5 h-1.5 bg-tertiary-container rounded-full" />
                <span>100% Personal Notes</span>
              </div>
            </div>
          </div>

          {/* Right Column: Developer Workbench Terminal - hidden on phones, shown on tablet+ */}
          <div className="hidden md:block lg:col-span-5 relative min-w-0 mt-4 lg:mt-10 lg:-translate-x-6">
            <div className="hidden sm:flex absolute -top-4 right-1 z-20 px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] rounded font-label-sm text-label-sm uppercase font-bold items-center gap-1.5 rotate-2">
              <span className="w-2 h-2 rounded-full bg-tertiary-container" />
              <span>99.98% Uptime</span>
            </div>
            <div className="hidden sm:flex absolute -bottom-5 left-5 z-20 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] rounded font-label-sm text-label-sm uppercase font-bold items-center gap-1.5 -rotate-2">
              <Icon name="rocket_launch" size={14} />
              <span>Deployed v2.4</span>
            </div>
            <div className="w-full bg-[#18181b] text-[#F4F4F5] border-2 border-on-surface shadow-[6px_6px_0px_0px_var(--color-ink)] rounded-lg overflow-hidden flex flex-col">
              <div className="bg-[#27272A] px-4 py-3 border-b-2 border-[#18181b] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-dot-red border border-black/40 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-dot-yellow border border-black/40 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-dot-green border border-black/40 inline-block" />
                </div>
                <span className="font-mono-code text-mono-code text-xs text-[#A1A1AA] tracking-wide">
                  harshxdotin@log:~
                </span>
                <span className="font-mono-code text-[11px] text-[#71717A]">zsh (node-v20)</span>
              </div>
              <div className="p-4 sm:p-6 lg:p-8 font-mono-code text-[12px] sm:text-[13px] leading-relaxed overflow-x-auto space-y-2.5">
                <div>
                  <span className="text-[#FB923C] font-bold">const</span>{" "}
                  <span className="text-[#60A5FA]">developer</span>{" = {"}
                </div>
                <div className="pl-5">
                  <span className="text-[#2DD4BF] font-semibold">name</span>
                  <span className="text-[#A1A1AA]">: </span>
                  <span className="text-[#34D399]">&quot;Harsh&quot;</span>
                  <span className="text-[#A1A1AA]">,</span>
                </div>
                <div className="pl-5">
                  <span className="text-[#2DD4BF] font-semibold">handle</span>
                  <span className="text-[#A1A1AA]">: </span>
                  <a
                    className="text-[#34D399] hover:text-[#6EE7B7] transition-colors"
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    &quot;@harshxdotin&quot;
                  </a>
                  <span className="text-[#A1A1AA]">,</span>
                </div>
                <div className="pl-5">
                  <span className="text-[#2DD4BF] font-semibold">focus</span>
                  <span className="text-[#A1A1AA]">: </span>
                  <span className="text-[#34D399]">&quot;Full-Stack&quot;</span>
                  <span className="text-[#A1A1AA]">,</span>
                </div>
                <div className="pl-5">
                  <span className="text-[#2DD4BF] font-semibold">status</span>
                  <span className="text-[#A1A1AA]">: </span>
                  <TypingStatus
                    phrases={[
                      "profiling things that shouldn't be slow",
                      "deleting more code than I write",
                      "turning coffee into green CI",
                      "documenting the rabbit hole",
                      "refactoring something stable",
                    ]}
                  />
                </div>
                <div className="pt-1">
                  {"}"}
                  <span className="inline-block w-2 h-4 bg-[#FB923C] animate-pulse align-middle ml-1" />
                </div>
              </div>
              <div className="bg-[#09090B] p-3.5 border-t-2 border-[#27272A] font-mono-code text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[#A1A1AA]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#22C55E]">✔</span>
                    <span>
                      build: success in <span className="text-[#F4F4F5] font-bold">42ms</span>
                    </span>
                  </div>
                  <span className="text-[#10B981] bg-[#064E3B] px-2 py-0.5 rounded border border-[#047857] text-[10px] font-bold">
                    ALL TESTS PASSED
                  </span>
                </div>
                <div className="text-[#71717A] text-[11px] flex items-center gap-2">
                  <span>$ git commit -m &quot;fix: it works on my machine&quot;</span>
                  <span className="inline-block w-2 h-3.5 bg-[#A1A1AA] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: CURRENTLY BUILDING */}
        {project && <CurrentlyBuilding project={project} />}

        {/* SECTION 3: LATEST FROM THE JOURNAL */}
        <section className="w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b-2 border-on-surface">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono-code text-xs uppercase tracking-wider text-primary font-bold">
                <Icon name="edit_note" size={16} />
                <span>Field Notes &amp; Architecture</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
                Latest from the journal
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                Reflections, postmortems, and technical explorations.
              </p>
            </div>
            <Link
              className="hidden md:inline-flex items-center gap-1.5 font-mono-code text-mono-code font-bold text-on-surface hover:text-primary transition-colors"
              href="/articles"
            >
              <span>View all articles</span>
              <Icon name="arrow_forward" size={18} />
            </Link>
          </div>

          {featured && <FeaturedArticle post={featured} />}

          {gridPosts.length > 0 ? (
            <div
              className={`grid grid-cols-1 gap-6 ${
                gridPosts.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
              }`}
            >
              {gridPosts.map((post) => (
                <ArticleCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            /* Featured is excluded from the grid, so "no posts" is only true
               when there is not even a featured one to show above. */
            !featured && (
              <EmptyState
                icon="article"
                label="Journal // empty"
                title="No articles published yet"
                description="Build logs, postmortems, and field notes will appear here the moment they go live."
              />
            )
          )}
        </section>

        {/* SECTION 4: RECENT PROJECTS - always rendered; when there is nothing
            beyond the featured spotlight it shows a blank state instead of
            hiding the whole section. */}
        <section className="w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b-2 border-on-surface">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono-code text-xs uppercase tracking-wider text-primary font-bold">
                <Icon name="handyman" size={16} />
                <span>Bench to Production</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
                Recent projects
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                Things I designed, shipped and maintained - source included.
              </p>
            </div>
            <Link
              className="hidden md:inline-flex items-center gap-1.5 font-mono-code text-mono-code font-bold text-on-surface hover:text-primary transition-colors"
              href="/projects"
            >
              <span>View all projects</span>
              <Icon name="arrow_forward" size={18} />
            </Link>
          </div>
          {recentProjects.length > 0 ? (
            /* Same 12-col grid as the projects page; span adapts to the card
               count so 1 fills the row and a pair splits it evenly. */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {recentProjects.map((p) => (
                <ProjectCard key={p._id} project={p} className={projectSpan} />
              ))}
            </div>
          ) : allProjects.length === 0 ? (
            <EmptyState
              icon="handyman"
              label="Workbench // quiet"
              title="No public projects right now"
              description="Everything in the lab is archived for now. Active and shipped builds will show up here again."
            />
          ) : (
            <EmptyState
              icon="handyman"
              label="Workbench // quiet"
              title="More builds are cooking"
              description="The spotlight above is my only public project for now - the rest of the bench is still in progress."
            />
          )}
        </section>
      </div>
    </div>
  );
}
