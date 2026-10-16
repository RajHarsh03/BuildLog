import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getFeaturedProject } from "@/lib/content/projects";
import { getPostStats } from "@/lib/content/posts";
import { DEFAULT_ABOUT, featuredJourney, getAboutContent } from "@/lib/content/about";
import { absoluteUrl, author } from "@/lib/utils";

export const revalidate = 60;

const DESCRIPTION = `About ${author.name} - ${author.role}. The person behind BuildLog.`;

export const metadata: Metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    title: `About ${author.name} - BuildLog`,
    description: DESCRIPTION,
    url: absoluteUrl("/about"),
    type: "profile",
  },
};

const SOCIALS: { label: string; icon: string; href: string }[] = [
  { label: "GitHub", icon: "code", href: "https://github.com/RajHarsh03" },
  { label: "LinkedIn", icon: "work", href: "https://www.linkedin.com/in/rajharsh03" },
  { label: "Email", icon: "mail", href: "mailto:rajharsh.devx@gmail.com" },
  { label: "Twitter", icon: "alternate_email", href: "https://twitter.com/RajHarsh03" },
];

export default async function AboutPage() {
  // Content is managed from the dashboard (/admin/about); DB outage falls back
  // to the original defaults so the public page never breaks.
  const [project, stats, aboutRaw] = await Promise.all([
    getFeaturedProject().catch(() => null),
    getPostStats().catch(() => ({ total: 0, published: 0, drafts: 0 })),
    getAboutContent().catch(() => null),
  ]);
  const about = aboutRaw ?? { _id: "", ...DEFAULT_ABOUT };
  const journey = featuredJourney(about);

  return (
    <div className="w-full px-5 sm:px-8 py-8">
      <div className="flex flex-col w-full space-y-12 pb-16">
        {/* Intro */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <Breadcrumbs items={[{ label: "About" }]} />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-lowest border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] rounded">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-bold">
                {author.role}
              </span>
            </div>
            <h1 className="font-display text-display-mobile md:text-display text-on-surface tracking-tight leading-none">
              Hi, I&apos;m {author.name}.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed whitespace-pre-line">
              {about.intro}
            </p>
            <div className="flex flex-wrap gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest text-on-surface font-mono-code text-label-md font-bold rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                  href={s.href}
                  {...(s.href.startsWith("http") || s.href.startsWith("mailto:")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <Icon name={s.icon} size={18} />
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Profile card */}
          <div className="lg:col-span-4 relative lg:mt-24 lg:-translate-x-12">
            <div className="hidden sm:flex absolute -top-4 right-1 z-20 px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] rounded font-label-sm text-label-sm uppercase font-bold items-center gap-1.5 rotate-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary-container" />
              </span>
              <span>Always Building</span>
            </div>
            <div className="hidden sm:flex absolute -bottom-4 left-2 z-20 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] rounded font-label-sm text-label-sm uppercase font-bold items-center gap-1.5 -rotate-2">
              <Icon name="engineering" size={14} />
              <span>Builds · Learns · Documents</span>
            </div>
            <div className="bg-surface-container-lowest border-2 border-on-surface shadow-[6px_6px_0px_0px_var(--color-ink)] rounded-lg p-6 space-y-5">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Harsh Raj"
                  className="w-20 h-20 rounded-full object-cover border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] shrink-0"
                  src={author.avatar}
                />
                <div className="space-y-1.5 min-w-0">
                  <div className="font-headline-md text-headline-md font-bold text-on-surface">
                    Harsh Raj
                  </div>
                  <a
                    className="inline-flex items-center gap-1 font-mono-code text-label-sm text-primary font-bold"
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {author.handle}
                    <Icon name="arrow_outward" size={13} />
                  </a>
                </div>
              </div>
              <div className="border-t-2 border-surface-container pt-4 space-y-2 font-mono-code text-label-sm">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Published</span>
                  <span className="font-bold text-on-surface">{stats.published}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Drafts</span>
                  <span className="font-bold text-on-surface">{stats.drafts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Location</span>
                  <span className="font-bold text-on-surface">Kolkata, IN</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Journey */}
        <section className="space-y-6">
          <div className="pb-4 border-b-2 border-on-surface">
            <div className="flex items-center gap-2 font-mono-code text-xs uppercase tracking-wider text-primary font-bold">
              <Icon name="route" size={16} />
              <span>The Path So Far</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
              Journey
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journey.map((j) => (
              <div
                key={`${j.year}-${j.title}`}
                className="bg-surface-container-lowest border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] rounded-lg p-6 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all"
              >
                <div className="font-mono-code text-label-md font-bold text-primary mb-2">
                  {j.year}
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
                  {j.title}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {j.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="space-y-6">
          <div className="pb-4 border-b-2 border-on-surface">
            <div className="flex items-center gap-2 font-mono-code text-xs uppercase tracking-wider text-primary font-bold">
              <Icon name="build" size={16} />
              <span>The Toolbox</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
              Skills
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {about.skills.map((s) => (
              <div
                key={`${s.group}-${s.icon}`}
                className="bg-surface-container-lowest border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] rounded-lg p-5 space-y-3"
              >
                <div className="flex items-center gap-2 font-mono-code text-label-md font-bold text-on-surface uppercase">
                  <Icon name={s.icon} size={18} className="text-primary" />
                  <span>{s.group}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.items.map((item) => (
                    <span
                      key={item}
                      className="font-mono-code text-[11px] px-2 py-0.5 bg-surface-container text-on-surface rounded border border-[var(--color-ink)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Current build */}
        {project && (
          <section className="space-y-6">
            <div className="pb-4 border-b-2 border-on-surface">
              <div className="flex items-center gap-2 font-mono-code text-xs uppercase tracking-wider text-primary font-bold">
                <Icon name="rocket_launch" size={16} />
                <span>On The Bench</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
                Currently Building
              </h2>
            </div>
            <div className="bg-mint-soft border-2 border-on-surface shadow-[6px_6px_0px_0px_var(--color-ink)] rounded-lg p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3">
                  <StatusBadge status={project.status} label={project.status} />
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  {project.name}
                </h3>
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  {project.description}
                </p>
              </div>
              <Link
                className="shrink-0 px-5 py-3 bg-on-surface text-surface font-mono-code text-mono-code font-bold uppercase tracking-wider border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all inline-flex items-center gap-2"
                href={`/projects/${project.slug}`}
              >
                <span>Read the specs</span>
                <Icon name="arrow_forward" size={18} />
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
