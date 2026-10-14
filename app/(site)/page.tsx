import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { CurrentlyBuilding } from "@/components/home/CurrentlyBuilding";
import { TypingStatus } from "@/components/home/TypingStatus";
import { FeaturedArticle } from "@/components/blog/FeaturedArticle";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { getFeaturedPost, getLatestPosts, getPostStats } from "@/lib/content/posts";
import { getFeaturedProject } from "@/lib/content/projects";
import { author } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Public site must render even if the DB is unavailable; degrade gracefully.
  const [featured, latest, stats, project] = await Promise.all([
    getFeaturedPost().catch(() => null),
    getLatestPosts(3).catch(() => []),
    getPostStats().catch(() => ({ total: 0, published: 0, drafts: 0 })),
    getFeaturedProject().catch(() => null),
  ]);

  const gridPosts = featured ? latest.filter((p) => p._id !== featured._id) : latest;

  return (
    <div className="w-full px-5 sm:px-8 py-8 overflow-x-clip">
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
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <Link
                className="px-6 py-3 bg-primary-container text-on-primary font-mono-code text-mono-code font-bold uppercase tracking-wider border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all inline-flex items-center gap-2"
                href="/articles"
              >
                <span>Read Articles</span>
                <Icon name="arrow_forward" size={18} />
              </Link>
              <Link
                className="px-6 py-3 bg-surface-container-lowest text-on-surface font-mono-code text-mono-code font-bold uppercase tracking-wider border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all inline-flex items-center gap-2"
                href="/projects"
              >
                <span>View Projects</span>
                <Icon name="terminal" size={18} />
              </Link>
            </div>
            <div className="pt-4 border-t-2 border-on-surface w-full max-w-xl flex flex-wrap items-center gap-y-2 gap-x-4 font-mono-code text-mono-code text-on-surface-variant">
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

          {/* Right Column: Developer Workbench Terminal */}
          <div className="lg:col-span-5 relative min-w-0 mt-4 lg:mt-10 lg:-translate-x-6">
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
              className="inline-flex items-center gap-1.5 font-mono-code text-mono-code font-bold text-on-surface hover:text-primary transition-colors"
              href="/articles"
            >
              <span>View all articles</span>
              <Icon name="arrow_forward" size={18} />
            </Link>
          </div>

          {featured && <FeaturedArticle post={featured} />}

          {gridPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gridPosts.map((post) => (
                <ArticleCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant">
              No articles published yet. Run <code>npm run seed</code> to populate the journal.
            </p>
          )}
        </section>

        {/* SECTION 4: NEWSLETTER / RSS CALLOUT */}
        <section className="w-full">
          <div className="bg-paper border-2 border-on-surface shadow-[6px_6px_0px_0px_var(--color-ink)] rounded-lg p-6 sm:p-10 relative overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-on-surface pb-4 mb-6">
              <div className="flex items-center gap-2 font-mono-code text-xs font-bold uppercase tracking-wider text-on-surface">
                <Icon name="mark_email_unread" size={18} className="text-primary" />
                <span>DISPATCHES FROM THE ENGINE ROOM</span>
              </div>
              <span className="font-mono-code text-xs text-on-surface-variant hidden sm:inline-block">
                ZERO SPAM • 1-CLICK UNSUBSCRIBE
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-3">
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
                  Get notified when I ship something new.
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xl leading-relaxed">
                  No spam, no marketing pitches — just engineering essays, deep postmortems, and open
                  source releases directly from my desk.
                </p>
              </div>
              <NewsletterForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
