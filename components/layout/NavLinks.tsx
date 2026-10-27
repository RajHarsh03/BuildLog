"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

const LINKS = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/articles", label: "Articles", match: (p: string) => p.startsWith("/articles") },
  { href: "/projects", label: "Projects", match: (p: string) => p.startsWith("/projects") },
  { href: "/about", label: "About", match: (p: string) => p.startsWith("/about") },
];

/**
 * Statically prerendered HTML can bake the nav without an active pill (the
 * root route especially, where usePathname is empty during generation), and
 * an effect-only resync was proven not to patch it in production. So on the
 * client the highlight is derived from the LIVE browser URL during render -
 * correct from the very first hydration pass - with a forced re-render on
 * navigation so route changes keep it in sync.
 */
function useLivePath() {
  const pathname = usePathname();
  const [, forceSync] = useState(0);
  useEffect(() => forceSync((n) => n + 1), [pathname]);
  if (typeof window !== "undefined") return window.location.pathname;
  return pathname;
}

export function NavLinks() {
  const current = useLivePath();

  return (
    <nav
      className="hidden md:flex items-center gap-2 p-1 border-2 border-[var(--color-ink)] bg-surface-container-lowest shadow-[2px_2px_0px_0px_var(--color-ink)] rounded-lg"
      aria-label="Main"
    >
      {LINKS.map((link) => {
        const active = link.match(current);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "px-3 py-1 rounded-sm transition-all whitespace-nowrap",
              active
                ? "font-mono-code text-[13px] bg-primary-container text-on-primary-container font-bold shadow-[2px_2px_0px_0px_var(--color-ink)] border-2 border-[var(--color-ink)]"
                : "font-mono-code text-[13px] text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Compact mobile 4-col nav with the same active-page highlight as desktop. */
export function MobileNavLinks() {
  const current = useLivePath();

  return (
    <nav
      aria-label="Mobile"
      className="grid grid-cols-4 gap-1.5 font-mono-code text-[12px]"
    >
      {LINKS.map((link) => {
        const active = link.match(current);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "px-1 py-1 text-center rounded border-2 border-[var(--color-ink)] overflow-hidden text-ellipsis whitespace-nowrap",
              active
                ? "bg-primary-container text-on-primary-container font-bold shadow-[2px_2px_0px_0px_var(--color-ink)]"
                : "bg-surface-container-lowest text-on-surface active:bg-surface-container",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
