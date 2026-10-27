"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminComments, type CommentGroup } from "@/components/admin/AdminComments";
import { Icon } from "@/components/shared/Icon";
import { useToast } from "@/components/shared/Toast";
import { cn } from "@/lib/utils";

type Tab = "posts" | "projects";

const countOf = (groups: CommentGroup[]) =>
  groups.reduce((n, g) => n + g.comments.length, 0);

/**
 * Comment moderation with Posts / Projects filter tabs, styled exactly like
 * the admin posts status tabs (PUBLISHED / DRAFTS / ARCHIVED).
 */
export function CommentsBrowser({
  postGroups,
  projectGroups,
}: {
  postGroups: CommentGroup[];
  projectGroups: CommentGroup[];
}) {
  const [tab, setTab] = useState<Tab>("posts");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Re-run the server-side comment query (new reader comments, edits, other
  // devices) without a full page reload.
  const refresh = () => {
    if (busy) return;
    setBusy(true);
    void Promise.resolve(router.refresh()).then(() => {
      setBusy(false);
      toast("Comments refreshed", "info");
    });
  };

  const tabs: { key: Tab; label: string; groups: CommentGroup[] }[] = [
    { key: "posts", label: "Posts", groups: postGroups },
    { key: "projects", label: "Projects", groups: projectGroups },
  ];
  const active = tabs.find((t) => t.key === tab) ?? tabs[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5 sm:gap-2" role="tablist" aria-label="Comment source">
        {tabs.map((t) => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center justify-center px-2 py-1 sm:px-3 sm:py-1.5 font-mono-code text-[9px] sm:text-label-sm font-bold uppercase tracking-tight sm:tracking-wider rounded border-2 transition-all whitespace-nowrap",
                on
                  ? "bg-on-surface text-surface border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)]"
                  : "bg-surface-container-lowest text-on-surface-variant border-on-surface hover:text-on-surface",
              )}
            >
              {t.label}
              <span className="ml-0.5 sm:ml-1.5 opacity-70">{countOf(t.groups)}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={refresh}
        disabled={busy}
        aria-label="Refresh comments"
        title="Refresh comments"
        className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border-2 border-on-surface bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:shadow-[2px_2px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-60 font-mono-code text-[10px] sm:text-label-sm font-bold uppercase tracking-wider whitespace-nowrap"
      >
        <Icon name="refresh" size={15} className={busy ? "animate-spin" : undefined} />
        <span className="hidden sm:inline">Refresh</span>
      </button>
      </div>

      {active.groups.length > 0 ? (
        // key: remount so AdminComments' local state re-seeds per tab.
        <AdminComments key={tab} groups={active.groups} />
      ) : (
        // Same ink-bordered, hard-shadowed card as AdminComments' empty state.
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] p-12 text-center">
          <Icon name="forum" size={40} className="mx-auto text-on-surface-variant" />
          <p className="font-body-md text-body-md text-on-surface-variant mt-3">
            No comments to moderate here yet.
          </p>
        </div>
      )}
    </div>
  );
}
