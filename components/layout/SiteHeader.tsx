import Link from "next/link";
import { NavLinks } from "@/components/layout/NavLinks";
import { SiteSearch } from "@/components/layout/SiteSearch";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { WORDMARK_URL, author } from "@/lib/utils";

interface SiteHeaderProps {
  nowBuilding?: string;
}

export function SiteHeader({ nowBuilding = "AI Code Reviewer" }: SiteHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-paper border-b-2 border-[var(--color-ink)]">
      <div className="h-20 w-full px-5 sm:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <Link className="flex items-center gap-3" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="BuildLog Wordmark Logo"
              className="h-10 w-auto object-contain dark:[filter:invert(1)_hue-rotate(180deg)]"
              src={WORDMARK_URL}
            />
          </Link>
        </div>

        <NavLinks />

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-mint-soft border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_0px_var(--color-ink)] rounded-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
            </span>
            <span className="font-label-sm text-label-sm uppercase font-bold text-mint-ink tracking-wider">
              Now building:
            </span>
            <span className="font-label-sm text-label-sm font-bold text-mint-ink">
              {nowBuilding}
            </span>
          </div>

          <SiteSearch />
          <ThemeToggle />

          <Link href="/about" className="relative ml-1" aria-label="About the author">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_0px_var(--color-ink)]"
              src={author.avatar}
            />
          </Link>
        </div>
      </div>

      {/* Compact mobile nav: equal-width 4-col grid so it always fits, even ~320px */}
      <div className="md:hidden border-t-2 border-[var(--color-ink)] bg-paper px-3 py-2">
        <nav
          aria-label="Mobile"
          className="grid grid-cols-4 gap-1.5 font-mono-code text-[12px]"
        >
          {[
            { href: "/", label: "Home" },
            { href: "/articles", label: "Articles" },
            { href: "/projects", label: "Projects" },
            { href: "/about", label: "About" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-1 py-1 text-center rounded border-2 border-[var(--color-ink)] bg-surface-container-lowest text-on-surface active:bg-surface-container overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
