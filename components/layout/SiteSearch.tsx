"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  kind: "post" | "project";
  title: string;
  subtitle: string;
  href: string;
}

interface SearchResponse {
  posts?: Array<{ slug: string; title: string; category: string }>;
  projects?: Array<{ slug: string; name: string; technologies: string[] }>;
}

/** Header search button + Ctrl/Cmd+K command-palette modal. */
export function SiteSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const requestId = useRef(0);

  const closeModal = useCallback(() => setOpen(false), []);

  // Global Ctrl/Cmd+K toggles the palette from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset + autofocus + scroll lock whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setActive(0);
    setLoading(false);
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Debounced search as the user types.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const current = ++requestId.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data: SearchResponse = await res.json();
        if (current !== requestId.current) return;
        const mapped: SearchResult[] = [
          ...(data.posts || []).map((p) => ({
            id: `post-${p.slug}`,
            kind: "post" as const,
            title: p.title,
            subtitle: p.category,
            href: `/articles/${p.slug}`,
          })),
          ...(data.projects || []).map((pr) => ({
            id: `project-${pr.slug}`,
            kind: "project" as const,
            title: pr.name,
            subtitle: pr.technologies?.slice(0, 3).join(" · ") || "Project",
            href: `/projects/${pr.slug}`,
          })),
        ];
        setResults(mapped);
        setActive(0);
      } catch {
        if (current === requestId.current) setResults([]);
      } finally {
        if (current === requestId.current) setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [query, open]);

  // Keep the highlighted row in view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function goTo(result: SearchResult) {
    closeModal();
    router.push(result.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length) setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length) setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) goTo(r);
    }
  }

  const hasQuery = query.trim().length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search posts and projects"
        className="p-2 bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_0px_var(--color-ink)] rounded-lg text-on-surface hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center"
      >
        <Icon name="search" size={20} weight={600} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh] pb-6 sm:pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="relative w-full max-w-2xl bg-paper border-2 border-[var(--color-ink)] shadow-[8px_8px_0px_0px_var(--color-ink)] rounded-lg overflow-hidden flex flex-col max-h-[80vh]">
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 sm:px-5 h-16 border-b-2 border-[var(--color-ink)] shrink-0">
              <Icon name="search" size={22} weight={500} className="text-on-surface-variant" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                type="text"
                placeholder="Search posts and projects…"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="flex-1 bg-transparent outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70"
              />
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close search"
                className="p-1.5 rounded hover:bg-surface-container-high transition-colors text-on-surface"
              >
                <Icon name="close" size={20} weight={500} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {!hasQuery && (
                <div className="flex flex-col items-center justify-center text-center px-6 py-16 sm:py-20 gap-3">
                  <div className="w-16 h-16 rounded-full border-2 border-[var(--color-ink)] bg-surface-container-low flex items-center justify-center">
                    <Icon name="search" size={28} weight={400} className="text-on-surface-variant" />
                  </div>
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">
                    Start typing to search
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Search across posts and projects
                  </p>
                  <p className="font-mono-code text-mono-code text-on-surface-variant mt-2 flex items-center gap-2">
                    <Kbd>Ctrl</Kbd>
                    <span className="opacity-40">+</span>
                    <Kbd>K</Kbd>
                    <span>to open anytime</span>
                  </p>
                </div>
              )}

              {hasQuery && loading && results.length === 0 && (
                <div className="flex items-center justify-center gap-2 px-6 py-16 text-on-surface-variant font-mono-code text-mono-code">
                  <Icon name="progress_activity" size={18} className="animate-spin" />
                  Searching…
                </div>
              )}

              {hasQuery && !loading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center px-6 py-16 gap-2">
                  <Icon name="search_off" size={30} weight={400} className="text-on-surface-variant" />
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    No matches for{" "}
                    <span className="font-semibold text-on-surface">&ldquo;{query.trim()}&rdquo;</span>
                  </p>
                </div>
              )}

              {results.length > 0 && (
                <ul ref={listRef} className="p-2 space-y-0.5">
                  {results.map((r, i) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        data-index={i}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => goTo(r)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors",
                          i === active
                            ? "bg-primary-container text-on-primary-container"
                            : "text-on-surface hover:bg-surface-container-high",
                        )}
                      >
                        <Icon
                          name={r.kind === "post" ? "article" : "rocket_launch"}
                          size={18}
                          weight={500}
                          className="shrink-0"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-body-md text-body-md font-semibold truncate">
                            {r.title}
                          </span>
                          <span className="block font-mono-code text-[11px] uppercase tracking-wide opacity-70 truncate">
                            {r.kind === "post" ? "Article" : "Project"} · {r.subtitle}
                          </span>
                        </span>
                        {i === active && (
                          <Icon name="arrow_forward" size={16} weight={500} className="shrink-0" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 sm:px-5 h-11 border-t-2 border-[var(--color-ink)] bg-surface-container-low shrink-0 font-mono-code text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>⏎</Kbd>
                Select
              </span>
              <span className="flex items-center gap-1.5 ml-auto">
                <Kbd>Esc</Kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[1px_1px_0px_0px_var(--color-ink)] rounded font-mono-code text-[11px] text-on-surface">
      {children}
    </kbd>
  );
}
