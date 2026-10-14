"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const LINKS = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/articles", label: "Articles", match: (p: string) => p.startsWith("/articles") },
  { href: "/projects", label: "Projects", match: (p: string) => p.startsWith("/projects") },
  { href: "/about", label: "About", match: (p: string) => p.startsWith("/about") },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav
      className="hidden md:flex items-center gap-2 p-1 border-2 border-[var(--color-ink)] bg-surface-container-lowest shadow-[2px_2px_0px_0px_var(--color-ink)] rounded-lg"
      aria-label="Main"
    >
      {LINKS.map((link) => {
        const active = link.match(pathname);
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
