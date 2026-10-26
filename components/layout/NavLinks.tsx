"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];

/**
 * The active pill is applied imperatively from the LIVE browser URL in an
 * effect, not through render output. Prerendered HTML cannot reliably know
 * the route (the root page bakes an empty path on Vercel), and React does
 * not patch className differences it did not cause - so a render-based
 * highlight silently never appears on the home route. Toggling a CSS class
 * from the DOM side is correct on every load, regardless of what was baked.
 */
function useActiveSync() {
  const pathname = usePathname();
  useEffect(() => {
    const path = window.location.pathname;
    document.querySelectorAll<HTMLElement>("[data-nav]").forEach((el) => {
      const href = el.getAttribute("data-nav") ?? "";
      const on =
        href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
      el.classList.toggle("nav-active", on);
      if (on) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
  }, [pathname]);
}

const pillBase =
  "px-3 py-1 rounded-sm transition-all whitespace-nowrap font-mono-code text-[13px] text-on-surface-variant hover:bg-surface-container hover:text-on-surface";

export function NavLinks() {
  useActiveSync();

  return (
    <nav
      className="hidden md:flex items-center gap-2 p-1 border-2 border-[var(--color-ink)] bg-surface-container-lowest shadow-[2px_2px_0px_0px_var(--color-ink)] rounded-lg"
      aria-label="Main"
    >
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} data-nav={link.href} className={pillBase}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

/** Compact mobile 4-col nav with the same active-page highlight as desktop. */
export function MobileNavLinks() {
  useActiveSync();

  return (
    <nav aria-label="Mobile" className="grid grid-cols-4 gap-1.5 font-mono-code text-[12px]">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          data-nav={link.href}
          className="px-1 py-1 text-center rounded border-2 border-[var(--color-ink)] bg-surface-container-lowest text-on-surface overflow-hidden text-ellipsis whitespace-nowrap transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
