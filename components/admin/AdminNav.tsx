"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { cn } from "@/lib/utils";

interface AdminNavProps {
  userName?: string | null;
  userImage?: string | null;
}

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/posts", label: "Posts", icon: "article", exact: false },
  { href: "/admin/projects", label: "Projects", icon: "rocket_launch", exact: false },
];

/** Sticky admin top bar with active-route highlighting and sign-out. */
export function AdminNav({ userName, userImage }: AdminNavProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 bg-paper border-b-2 border-on-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-mono-code text-mono-code font-bold tracking-tight text-on-surface shrink-0"
          >
            <span className="w-7 h-7 grid place-items-center bg-primary-container border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] rounded">
              <Icon name="terminal" size={16} />
            </span>
            <span className="hidden sm:inline">BuildLog CMS</span>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {LINKS.map((l) => {
              const active = isActive(l.href, l.exact);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 font-mono-code text-label-sm font-bold uppercase tracking-wider rounded border-2 whitespace-nowrap transition-all",
                    active
                      ? "bg-on-surface text-surface border-on-surface"
                      : "text-on-surface-variant border-transparent hover:text-on-surface hover:border-on-surface hover:bg-surface-container",
                  )}
                >
                  <Icon name={l.icon} size={16} />
                  <span className="hidden md:inline">{l.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono-code text-label-sm font-bold uppercase tracking-wider text-on-surface-variant rounded border-2 border-transparent hover:text-on-surface hover:border-on-surface hover:bg-surface-container transition-all"
          >
            <Icon name="open_in_new" size={16} />
            <span className="hidden sm:inline">View site</span>
          </Link>

          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={userName ?? "Admin"}
              title={userName ?? "Admin"}
              src={userImage}
              className="w-8 h-8 rounded-full border-2 border-on-surface object-cover"
            />
          ) : (
            <span className="w-8 h-8 grid place-items-center rounded-full border-2 border-on-surface bg-surface-container font-mono-code text-label-sm font-bold">
              {(userName ?? "A").charAt(0).toUpperCase()}
            </span>
          )}

          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
