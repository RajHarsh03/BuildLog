import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { author } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: "terminal" },
  { href: "/articles", label: "Articles & Logs", icon: "article" },
  { href: "/projects", label: "Projects", icon: "code" },
  { href: "/about", label: `About ${author.name}`, icon: "person" },
];

const FEEDS = [
  { href: "https://github.com/RajHarsh03", label: "GitHub", icon: "arrow_outward" },
  { href: "https://www.linkedin.com/in/rajharsh03", label: "LinkedIn", icon: "arrow_outward" },
  { href: "/articles#rss", label: "RSS Feed", icon: "rss_feed" },
  { href: "mailto:rajharsh.devx@gmail.com", label: "Email Logbook", icon: "mail" },
  { href: "https://github.com/RajHarsh03/BuildLog", label: "Source Code", icon: "code_blocks" },
];

export function SiteFooter() {
  return (
    <footer className="w-full bg-paper border-t-2 border-[var(--color-ink)] mt-auto">
      <div className="w-full px-5 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b-2 border-[var(--color-ink)]">
          <div className="md:col-span-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
                  BuildLog
                </span>
                <span className="font-mono-code text-mono-code text-on-surface-variant">
                  by {author.name}
                </span>
              </div>
              <p className="font-headline-md text-headline-md italic text-primary">
                &quot;Build. Learn. Document.&quot;
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
                Personal engineering notes, architectural experiments, and field learnings.
                Handcrafted with zero tracking, zero telemetry, and maximum curiosity.
              </p>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-bold mb-4 border-b-2 border-[var(--color-ink)] pb-1 inline-block">
              Navigation
            </h3>
            <ul className="space-y-2 font-mono-code text-mono-code">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
                    href={item.href}
                  >
                    <Icon name={item.icon} size={16} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-bold mb-4 border-b-2 border-[var(--color-ink)] pb-1 inline-block">
              Network &amp; Raw Feeds
            </h3>
            <ul className="space-y-2 font-mono-code text-mono-code">
              {FEEDS.map((item) => (
                <li key={item.label}>
                  <Link
                    className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between group"
                    href={item.href}
                  >
                    <span>{item.label}</span>
                    <Icon
                      name={item.icon}
                      size={16}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-label-sm text-label-sm">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
            </span>
            <span className="text-on-surface font-semibold">All systems operational</span>
            <span className="text-[var(--color-ink)]">•</span>
            <span>Kolkata, IN</span>
          </div>
          <div className="text-on-surface-variant font-mono-code">
            © {new Date().getFullYear()} BuildLog. Handcrafted under MIT License.
          </div>
        </div>
      </div>
    </footer>
  );
}
