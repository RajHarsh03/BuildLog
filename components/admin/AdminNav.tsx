"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Icon } from "@/components/shared/Icon";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { WORDMARK_URL } from "@/lib/utils";

interface AdminNavProps {
  userName?: string | null;
  userImage?: string | null;
}

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/posts", label: "Posts", exact: false },
  { href: "/admin/projects", label: "Projects", exact: false },
];

/** Sticky admin top bar styled identically to the public site header. */
export function AdminNav({ userName, userImage }: AdminNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the avatar menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 bg-paper border-b-2 border-[var(--color-ink)]">
      <div className="h-20 w-full px-5 sm:px-8 flex items-center justify-between gap-4">
        {/* Wordmark - same treatment as the public header */}
        <Link href="/admin" className="flex items-center shrink-0" aria-label="BuildLog CMS">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="BuildLog Wordmark Logo"
            className="h-10 w-auto object-contain dark:[filter:invert(1)_hue-rotate(180deg)]"
            src={WORDMARK_URL}
          />
        </Link>

        {/* Nav pill group - identical to public NavLinks */}
        <nav
          className="hidden md:flex items-center gap-2 p-1 border-2 border-[var(--color-ink)] bg-surface-container-lowest shadow-[2px_2px_0px_0px_var(--color-ink)] rounded-lg"
          aria-label="Admin"
        >
          {LINKS.map((link) => {
            const active = isActive(link.href, link.exact);
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

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="p-2 bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_0px_var(--color-ink)] rounded-lg text-on-surface hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center"
            aria-label="View site"
            title="View site"
          >
            <Icon name="open_in_new" size={20} weight={600} />
          </Link>

          <ThemeToggle />

          {/* Avatar doubles as the account menu trigger. */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Account menu"
              aria-expanded={menuOpen}
              className="block"
            >
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={userName ?? "Admin"}
                  title={userName ?? "Admin"}
                  src={userImage}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                />
              ) : (
                <span className="w-8 h-8 grid place-items-center rounded-full border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_0px_var(--color-ink)] bg-surface-container-lowest font-mono-code text-label-sm font-bold">
                  {(userName ?? "A").charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink)] rounded-lg p-2 z-50">
                <div className="px-2 py-1.5 font-mono-code text-[13px] text-on-surface-variant truncate">
                  {userName ?? "Admin"}
                </div>
                <div className="border-t-2 border-[var(--color-ink)]/10 mt-1 pt-2">
                  <SignOutButton onSignedOut={() => setMenuOpen(false)} fullWidth />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact mobile nav - mirrors the public header's mobile row */}
      <div className="md:hidden border-t-2 border-[var(--color-ink)] bg-paper px-4 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 font-mono-code text-mono-code whitespace-nowrap">
          {LINKS.map((l) => {
            const active = isActive(l.href, l.exact);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "px-3 py-1 rounded border-2 border-[var(--color-ink)]",
                  active
                    ? "bg-primary-container text-on-primary-container font-bold shadow-[2px_2px_0px_0px_var(--color-ink)]"
                    : "bg-surface-container-lowest",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
