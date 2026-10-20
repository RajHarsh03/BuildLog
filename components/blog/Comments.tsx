"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { signIn, signOut } from "next-auth/react";
import { Icon } from "@/components/shared/Icon";
import { useToast } from "@/components/shared/Toast";
import { SIGNED_IN_FLAG } from "@/components/shared/SessionWelcome";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types/comment";

interface SessionUser {
  name?: string | null;
  image?: string | null;
}

type TreeNode = Comment & { replies: TreeNode[] };

/** Older comments may lack authorLogin — recover it from the GitHub avatar URL. */
function loginOf(c: Comment): string | null {
  if (c.authorLogin) return c.authorLogin;
  const m = c.authorImage?.match(/^https?:\/\/github\.com\/([^/.?]+)(?:\.png)?$/i);
  return m?.[1] ?? null;
}

/** Relative "time ago" label, falling back to a date for old comments. */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Group flat comments into top-level threads with nested replies. */
function buildTree(comments: Comment[]): TreeNode[] {
  const nodes = new Map<string, TreeNode>();
  for (const c of comments) nodes.set(c._id, { ...c, replies: [] });
  const roots: TreeNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.replies.push(node);
    else roots.push(node);
  }
  return roots;
}

function Avatar({ src, name, size = "md" }: { src?: string | null; name: string; size?: "sm" | "md" }) {
  const dim = size === "md" ? "w-10 h-10 text-[14px]" : "w-8 h-8 text-[12px]";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        alt={name}
        src={src}
        className={`${dim} relative z-10 rounded-full object-cover border-2 border-on-surface shrink-0`}
      />
    );
  }
  return (
    <span
      className={`${dim} relative z-10 rounded-full grid place-items-center bg-surface-container border-2 border-on-surface font-mono-code font-bold text-on-surface shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * Site-native comments backed by MongoDB. Commenting is strictly gated:
 * signed-out readers only ever see the GitHub sign-in panel (never the
 * composer, not even while the session is still loading).
 */
export function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?postId=${encodeURIComponent(postId)}`)
      .then((r) => (r.ok ? r.json() : { comments: [] }))
      .then((d) => !cancelled && setComments(d.comments ?? []))
      .catch(() => {});
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (cancelled) return;
        setUser(s?.user ? { name: s.user.name, image: s.user.image } : null);
        setAuthChecked(true);
      })
      .catch(() => !cancelled && setAuthChecked(true));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const tree = useMemo(() => buildTree(comments), [comments]);
  const visibleRoots = tree.slice(0, 3);

  const submit = useCallback(async () => {
    const text = body.trim();
    if (!text || posting) return;
    setPosting(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");
      // Newest-first: a fresh comment belongs at the top of the thread.
      setComments((prev) => [data.comment as Comment, ...prev]);
      setBody("");
      toast("Comment posted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPosting(false);
    }
  }, [body, postId, posting]);

  // Threads whose replies are expanded (YouTube-style "Replies (N)" toggle).
  const [openReplies, setOpenReplies] = useState<Set<string>>(new Set());
  const toggleReplies = (id: string) =>
    setOpenReplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /** One comment row + its nested replies (depth 0 = thread root). */
  function renderNode(node: TreeNode, depth: number, isLast = true): ReactNode {
    const login = loginOf(node);
    const profileUrl = login ? `https://github.com/${login}` : null;
    // YouTube creator-heart style: owner's like shows as a heart badge on the
    // commenter's avatar.
    const avatarBase = <Avatar src={node.authorImage} name={node.authorName} size="sm" />;
    const avatar =
      node.likes > 0 ? (
        <span className="relative inline-flex shrink-0">
          {avatarBase}
          {/* YouTube creator-heart style: solid red heart with white outline.
              z-20: the avatar img is z-10 (to cover the thread line), so the
              badge must stack above it. */}
          <span className="group/heart absolute -bottom-0.5 -right-0.5 z-20 inline-flex">
            <svg
              viewBox="0 0 24 24"
              className="h-[15px] w-[15px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
              aria-hidden="true"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#E53935"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinejoin="round"
                paintOrder="stroke"
              />
            </svg>
            {/* Hover label: "♥ by @Name" */}
            <span className="pointer-events-none absolute top-full left-0 mt-1.5 hidden group-hover/heart:flex items-center gap-1 px-2 py-1 rounded border border-white/15 bg-[#1F1F1F] text-white font-mono-code text-[10px] font-bold whitespace-nowrap shadow-lg z-20">
              <svg viewBox="0 0 24 24" className="h-[10px] w-[10px]" aria-hidden="true">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="#FFFFFF"
                />
              </svg>
              by @{node.likedByNames?.length ? node.likedByNames.join(", ") : "Harsh Raj"}
            </span>
          </span>
        </span>
      ) : (
        avatarBase
      );
    return (
      <li key={node._id} className={cn(depth === 0 ? "py-4" : "relative pl-4 pt-3")}>
        {depth > 0 && (
          <>
            {/* Thread segment: starts behind the reply avatar (z-10) at its center */}
            <span
              aria-hidden
              className={cn(
                "absolute left-0 -top-4 w-0.5 bg-on-surface/60",
                isLast ? "h-[calc(28px+16px)]" : "h-[calc(100%+16px)]",
              )}
            />
            <span
              aria-hidden
              className="absolute left-0 top-[27px] h-0.5 w-4 bg-on-surface/60"
            />
          </>
        )}
        <div className="flex items-start gap-2.5">
            {profileUrl ? (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full hover:opacity-80 transition-opacity"
              >
                {avatar}
              </a>
            ) : (
              avatar
            )}
            {profileUrl ? (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 font-mono-code text-[11px] font-bold text-on-surface hover:text-primary transition-colors truncate"
              >
                {node.authorName}
              </a>
            ) : (
              <span className="min-w-0 flex-1 font-mono-code text-[11px] font-bold text-on-surface truncate">
                {node.authorName}
              </span>
            )}
            <span className="font-mono-code text-[10px] text-on-surface-variant shrink-0 ml-auto">
              {timeAgo(node.createdAt)}
            </span>
          </div>
        {node.replies.length > 0 ? (
          <div className="-mt-1 ml-[15px]">
            {/* Trunk line only appears once the reply tree is expanded */}
            <div className="relative pl-[27px]">
              {openReplies.has(node._id) && (
                <span
                  aria-hidden
                  className="absolute left-0 -top-3 h-[calc(100%+12px)] w-0.5 bg-on-surface/60"
                />
              )}
              {/* Mobile: opposite ends; desktop: toggle at ~28% of the row */}
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 sm:justify-start">
                <span className="min-w-0 font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap break-words sm:w-[28%] sm:shrink-0">
                  {node.body}
                </span>
                <button
                  type="button"
                  onClick={() => toggleReplies(node._id)}
                  aria-expanded={openReplies.has(node._id)}
                  className="shrink-0 inline-flex items-center gap-1 px-1.5 py-1 rounded font-mono-code text-[10px] font-bold uppercase tracking-wider text-primary hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  {openReplies.has(node._id) ? "Hide replies" : "Replies"}
                  <Icon name={openReplies.has(node._id) ? "expand_less" : "expand_more"} size={14} />
                </button>
              </div>
            </div>
            {openReplies.has(node._id) && (
              <ul className="mb-2">
                {node.replies.map((r, i) =>
                  renderNode(r, depth + 1, i === node.replies.length - 1),
                )}
              </ul>
            )}
          </div>
        ) : (
          <p className="-mt-1 ml-[42px] font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap break-words">
            {node.body}
          </p>
        )}
      </li>
    );
  }

  return (
    <section
      id="comments"
      className="mt-16 bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b-2 border-on-surface bg-surface-container-low">
        <h2 className="font-mono-code text-[11px] sm:text-mono-code font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
          <Icon name="forum" size={18} className="text-primary shrink-0" />
          Comments
        </h2>
        <span className="font-mono-code text-[10px] sm:text-label-sm font-bold px-2 py-0.5 rounded border-2 border-on-surface bg-surface-container text-on-surface whitespace-nowrap">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Composer area — strictly gated behind GitHub sign-in */}
      <div className="p-4 sm:p-6 border-b-2 border-surface-container-high">
        {!authChecked ? (
          /* Skeleton while the session is being resolved — never flash the composer */
          <div className="animate-pulse space-y-3" aria-hidden="true">
            <div className="h-20 rounded-lg bg-surface-container" />
            <div className="h-8 w-40 rounded bg-surface-container ml-auto" />
          </div>
        ) : !user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 rounded-lg border-2 border-dashed border-on-surface/35 bg-surface-container-low p-5 sm:px-6 sm:py-5">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-3 sm:gap-3.5">
                <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-surface-container-lowest text-primary border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] sm:shadow-[3px_3px_0px_0px_var(--color-ink)] grid place-items-center shrink-0">
                  <Icon name="code" size={16} />
                </span>
                <p className="font-headline-sm text-[19px] sm:text-[22px] font-bold text-on-surface whitespace-nowrap">
                  Join the discussion
                </p>
              </div>
              <p className="font-mono-code text-[12px] sm:text-[14px] text-on-surface-variant sm:pl-[50px]">
                GitHub-only comments on BuildLog — sign in once, post right away.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                void signIn("github", {
                  // Land back on the comments section after the OAuth redirect,
                  // not at the top of the page.
                  callbackUrl:
                    typeof window !== "undefined"
                      ? `${window.location.origin}${window.location.pathname}#comments`
                      : "/#comments",
                })
              }
              className="inline-flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto px-4 py-2.5 bg-primary-container text-on-primary-container font-mono-code text-[11px] sm:text-label-sm font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all whitespace-nowrap"
            >
              <Icon name="badge" size={16} />
              Sign in with GitHub
            </button>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-on-surface bg-surface-container-low p-4 sm:p-5 shadow-[3px_3px_0px_0px_var(--color-ink)]">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar src={user.image} name={user.name ?? "you"} />
                <span className="sm:hidden font-mono-code text-[11px] font-bold text-on-surface truncate">
                  {user.name ?? "you"}
                </span>
              </div>
              <div className="flex-1 min-w-0 w-full space-y-3">
                <div className="relative">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={2000}
                    rows={3}
                    placeholder={`Share your thoughts on this build, ${user.name?.split(" ")[0] ?? "friend"}…`}
                    className="w-full px-3.5 py-3 pb-7 bg-surface-container-lowest border-2 border-on-surface rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:shadow-[3px_3px_0px_0px_var(--color-ink)] transition-shadow resize-y min-h-[88px]"
                  />
                  <span className="pointer-events-none absolute bottom-1.5 right-2.5 font-mono-code text-[10px] text-on-surface-variant/70 tabular-nums">
                    {body.trim().length}/2000
                  </span>
                </div>
                {error && (
                  <p className="font-mono-code text-[11px] text-[#991B1B] flex items-center gap-1.5">
                    <Icon name="error" size={14} />
                    {error}
                  </p>
                )}
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Let the next sign-in greet again, then toast + stay on page.
                      try {
                        localStorage.removeItem(SIGNED_IN_FLAG);
                        sessionStorage.removeItem(SIGNED_IN_FLAG);
                      } catch {
                        /* storage disabled */
                      }
                      void signOut({ redirect: false }).then(() => {
                        // Cookie is cleared; drop the local session state so the
                        // gated UI re-renders immediately (no remount needed).
                        setUser(null);
                        toast("Signed out", "info");
                      });
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 shrink-0 border-2 border-on-surface rounded bg-surface-container-lowest font-mono-code text-[9px] sm:text-label-sm font-bold uppercase tracking-wider text-on-surface-variant hover:text-[#991B1B] hover:bg-[#FEE2E2] transition-colors whitespace-nowrap"
                    title="Sign out of GitHub"
                  >
                    <Icon name="logout" size={13} />
                    Sign out
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={posting || body.trim().length < 2}
                    className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-4 sm:py-2.5 shrink-0 bg-primary-container text-on-primary-container font-mono-code text-[9px] sm:text-label-sm font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] sm:shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
                  >
                    <Icon
                      name={posting ? "progress_activity" : "send"}
                      size={13}
                      className={posting ? "animate-spin" : ""}
                    />
                    {posting ? "Posting…" : "Post comment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Threads — only the 3 latest, newest first */}
      {tree.length > 0 && (
        <ul className="divide-y divide-surface-container-high px-4 sm:px-5">
          {visibleRoots.map((node) => renderNode(node, 0))}
        </ul>
      )}
    </section>
  );
}
