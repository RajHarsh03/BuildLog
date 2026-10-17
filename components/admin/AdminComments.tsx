"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types/comment";

export interface CommentGroup {
  postId: string;
  postTitle: string;
  postSlug: string;
  comments: Comment[];
}

type TreeNode = Comment & { replies: TreeNode[] };

/** Posts whose newest comment is older than this drop off the default list. */
const ACTIVE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function latestAt(g: CommentGroup): number {
  return Math.max(...g.comments.map((c) => Date.parse(c.createdAt)));
}

function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

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

function Avatar({ src, name }: { src?: string | null; name: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={name} src={src} className="w-8 h-8 rounded-full object-cover border-2 border-on-surface shrink-0" />;
  }
  return (
    <span className="w-8 h-8 rounded-full grid place-items-center bg-surface-container border-2 border-on-surface font-mono-code text-[12px] font-bold text-on-surface shrink-0">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function CommentNode({
  node,
  isRoot,
  onLike,
  onReply,
  onDelete,
  onEdit,
  busyId,
}: {
  node: TreeNode;
  isRoot: boolean;
  onLike: (id: string) => void;
  onReply: (parentId: string, postId: string, body: string) => Promise<void>;
  onDelete: (id: string) => void;
  onEdit: (id: string, body: string) => Promise<boolean>;
  busyId: string | null;
}) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  // Three-dots menu (children only) + inline edit mode.
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.body);
  const [saving, setSaving] = useState(false);

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    await onReply(node._id, node.postId, body);
    setSending(false);
    setReplying(false);
    setText("");
  }

  async function saveEdit() {
    const body = draft.trim();
    if (body.length < 2 || saving) return;
    setSaving(true);
    const ok = await onEdit(node._id, body);
    setSaving(false);
    if (ok) setEditing(false);
  }

  const login = node.authorLogin;
  const profileUrl = login ? `https://github.com/${login}` : null;
  const avatar = <Avatar src={node.authorImage} name={node.authorName} />;

  const bodyEl = editing ? (
    <div className="space-y-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={2}
        maxLength={2000}
        className="w-full px-3 py-2 bg-surface-container-lowest border-2 border-on-surface rounded font-body-md text-body-md text-on-surface focus:outline-none focus:shadow-[3px_3px_0px_0px_var(--color-ink)] transition-shadow resize-y min-h-[60px]"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="px-3 py-1.5 font-mono-code text-[10px] font-bold uppercase tracking-wider rounded border-2 border-on-surface/40 text-on-surface-variant hover:text-on-surface hover:border-on-surface transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={saveEdit}
          disabled={saving || draft.trim().length < 2 || draft.trim() === node.body}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-container text-on-primary-container font-mono-code text-[10px] font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
        >
          <Icon name={saving ? "progress_activity" : "check"} size={13} className={saving ? "animate-spin" : ""} />
          Save
        </button>
      </div>
    </div>
  ) : (
    <p className="font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap break-words">
      {node.body}
    </p>
  );

  // Dots menu belongs to children (admin replies) only — roots use the header trash icon.
  const menuEl =
    !isRoot && !editing ? (
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          title="More actions"
          aria-expanded={menuOpen}
          className="p-1.5 rounded text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <Icon name="more_vert" size={15} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-30 min-w-[110px] sm:min-w-[150px] bg-surface-container-lowest border-2 border-on-surface rounded shadow-[3px_3px_0px_0px_var(--color-ink)] py-1">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setDraft(node.body);
                  setEditing(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 font-mono-code text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-on-surface hover:bg-surface-container transition-colors"
              >
                <Icon name="edit" size={13} className="shrink-0" />
                Edit comment
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(node._id);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 font-mono-code text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-[#B3261E] hover:bg-surface-container transition-colors"
              >
                <Icon name="delete" size={13} className="shrink-0" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    ) : null;

  return (
    <div
      className={cn(
        "rounded-lg",
        isRoot
          ? "border-2 border-on-surface bg-surface-container-low shadow-[3px_3px_0px_0px_var(--color-ink)] p-3 sm:p-3.5"
          : "p-0",
      )}
    >
      {/* Single compact header: who + when … actions */}
      <div className="flex items-start gap-2 min-w-0">
        {profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`@${login} on GitHub`}
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
            className="min-w-0 font-mono-code text-[12px] font-bold text-on-surface hover:text-primary transition-colors truncate"
          >
            {node.authorName}
          </a>
        ) : (
          <span className="min-w-0 font-mono-code text-[12px] font-bold text-on-surface truncate">
            {node.authorName}
          </span>
        )}
        <span className="font-mono-code text-[10px] text-on-surface-variant shrink-0">
          {timeAgo(node.createdAt)}
        </span>

        {/* Replies get the dots menu on the side, mirroring the root's header actions */}
        {!isRoot && <div className="ml-auto">{menuEl}</div>}

        {/* Actions belong to the thread root only — replies stay plain (YT style) */}
        {isRoot && (
          <div className="ml-auto flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (node.likedByMe) return;
                onLike(node._id);
              }}
              aria-disabled={node.likedByMe || busyId === node._id || undefined}
              title={node.likedByMe ? "Liked (one-time)" : "Like this comment"}
              aria-pressed={node.likedByMe}
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-1 rounded font-mono-code text-[10px] font-bold transition-colors",
                node.likedByMe
                  ? "text-[#991B1B] cursor-default"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
                busyId === node._id && "opacity-50",
              )}
            >
              <Icon name={node.likedByMe ? "favorite" : "favorite_border"} fill={node.likedByMe} size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (node.replies.length > 0) return;
                setReplying((v) => !v);
              }}
              aria-disabled={node.replies.length > 0 || undefined}
              title={node.replies.length > 0 ? "Replied (one-time)" : "Reply to this comment"}
              className={cn(
                "p-1.5 rounded transition-colors",
                node.replies.length > 0
                  ? "text-on-surface-variant/40 cursor-default"
                  : replying
                    ? "text-primary bg-surface-container"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
              )}
            >
              <Icon name={replying ? "close" : "reply"} size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(node._id)}
              disabled={busyId === node._id}
              title="Delete this comment and its replies"
              className="p-1.5 rounded text-on-surface-variant hover:text-[#B3261E] hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              <Icon name="delete" size={14} />
            </button>
          </div>
        )}
      </div>

      {node.replies.length > 0 ? (
        <>
          <div className="-mt-1 ml-[15px]">
            {/* Trunk: starts right under the parent avatar, runs through body to the last reply */}
            <div className="relative pl-[27px]">
              <span
                aria-hidden
                className="absolute left-0 -top-1 h-[calc(100%+4px)] w-0.5 bg-on-surface/60"
              />
              {bodyEl}
            </div>
            <ul>
              {node.replies.map((r, i) => {
                const isLastReply = i === node.replies.length - 1;
                return (
                  <li key={r._id} className="relative pl-4 pt-3">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 top-0 w-0.5 bg-on-surface/60",
                        isLastReply ? "h-[28px]" : "h-full",
                      )}
                    />
                    <span
                      aria-hidden
                      className="absolute left-0 top-[27px] h-0.5 w-4 bg-on-surface/60"
                    />
                    <CommentNode node={r} isRoot={false} onLike={onLike} onReply={onReply} onDelete={onDelete} onEdit={onEdit} busyId={busyId} />
                  </li>
                );
              })}
            </ul>
          </div>
          {/* Reply box sits below the whole thread, full card width (same as no-reply case) */}
          {replying && (
            <div className="mt-3 space-y-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                maxLength={2000}
                placeholder={`Reply to ${node.authorName}…`}
                className="w-full px-3 py-2 bg-surface-container-lowest border-2 border-on-surface rounded font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:shadow-[3px_3px_0px_0px_var(--color-ink)] transition-shadow resize-y min-h-[60px]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || text.trim().length < 2}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[9px] sm:px-3 sm:py-1.5 sm:text-[10px] bg-primary-container text-on-primary-container font-mono-code font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
                >
                  <Icon name={sending ? "progress_activity" : "send"} size={13} className={sending ? "animate-spin" : ""} />
                  Send reply
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="-mt-1 ml-10">
            {bodyEl}
          </div>
          {replying && (
            <div className="mt-2.5 space-y-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                maxLength={2000}
                placeholder={`Reply to ${node.authorName}…`}
                className="w-full px-3 py-2 bg-surface-container-lowest border-2 border-on-surface rounded font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:shadow-[3px_3px_0px_0px_var(--color-ink)] transition-shadow resize-y min-h-[60px]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || text.trim().length < 2}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[9px] sm:px-3 sm:py-1.5 sm:text-[10px] bg-primary-container text-on-primary-container font-mono-code font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
                >
                  <Icon name={sending ? "progress_activity" : "send"} size={13} className={sending ? "animate-spin" : ""} />
                  Send reply
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Admin moderation view: all reader comments grouped by post, with reply + like. */
export function AdminComments({ groups: initialGroups }: { groups: CommentGroup[] }) {
  const [groups, setGroups] = useState<CommentGroup[]>(initialGroups);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Post threads start collapsed; clicking the header toggles the comments.
  const [openPosts, setOpenPosts] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const total = useMemo(() => groups.reduce((sum, g) => sum + g.comments.length, 0), [groups]);

  // Newest-comment-first; stale threads hidden unless "all" is requested.
  const { active, stale } = useMemo(() => {
    const withComments = groups
      .filter((g) => g.comments.length > 0)
      .sort((a, b) => latestAt(b) - latestAt(a));
    const fresh = withComments.filter((g) => Date.now() - latestAt(g) <= ACTIVE_WINDOW_MS);
    return { active: fresh, stale: withComments.filter((g) => !fresh.includes(g)) };
  }, [groups]);

  const visible = showAll ? [...active, ...stale] : active;

  function replaceComment(updated: Comment) {
    setGroups((prev) =>
      prev.map((g) =>
        g.comments.some((c) => c._id === updated._id)
          ? { ...g, comments: g.comments.map((c) => (c._id === updated._id ? updated : c)) }
          : g,
      ),
    );
  }

  async function toggleLike(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: id }),
      });
      const data = await res.json();
      if (res.ok && data.comment) replaceComment(data.comment as Comment);
    } finally {
      setBusyId(null);
    }
  }

  async function reply(parentId: string, postId: string, body: string) {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, body, parentId }),
    });
    const data = await res.json();
    if (res.ok && data.comment) {
      setGroups((prev) =>
        prev.map((g) => (g.postId === postId ? { ...g, comments: [data.comment, ...g.comments] } : g)),
      );
    }
  }

  /** Permanently remove a comment (and its replies) from the DB. */
  async function removeComment(id: string) {
    if (!window.confirm("Delete this comment and its replies? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setGroups((prev) =>
          prev
            .map((g) => ({
              ...g,
              comments: g.comments.filter((c) => c._id !== id && c.parentId !== id),
            }))
            .filter((g) => g.comments.length > 0),
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  /** Admin inline edit; resolves true on success so the node can leave edit mode. */
  async function editComment(id: string, body: string): Promise<boolean> {
    setBusyId(id);
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        replaceComment(data.comment as Comment);
        return true;
      }
      return false;
    } finally {
      setBusyId(null);
    }
  }

  if (total === 0) {
    return (
      <div className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] p-12 text-center">
        <Icon name="forum" size={40} className="mx-auto text-on-surface-variant" />
        <p className="font-body-md text-body-md text-on-surface-variant mt-3">
          No comments yet across the site.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity filter row */}
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono-code text-[11px] sm:text-label-sm text-on-surface-variant">
          {showAll ? "All threads" : "Active this week"} · sorted by latest comment
        </span>
        {stale.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border-2 border-on-surface bg-surface-container-lowest font-mono-code text-[10px] sm:text-label-sm font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors whitespace-nowrap"
          >
            <Icon name={showAll ? "bolt" : "history"} size={13} />
            {showAll ? "Active only" : `Older (${stale.length})`}
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] p-10 text-center">
          <Icon name="schedule" size={36} className="mx-auto text-on-surface-variant" />
          <p className="font-body-md text-body-md text-on-surface-variant mt-3">
            No comments in the last 7 days.
          </p>
        </div>
      ) : (
        visible.map((g) => {
          const tree = buildTree(g.comments);
          const open = Boolean(openPosts[g.postId]);
          return (
            <section
              key={g.postId}
              className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] overflow-hidden"
            >
              {/* Post header — click anywhere to expand/collapse the thread */}
              <div
                role="button"
                tabIndex={0}
                aria-expanded={open}
                onClick={() => setOpenPosts((prev) => ({ ...prev, [g.postId]: !open }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpenPosts((prev) => ({ ...prev, [g.postId]: !open }));
                  }
                }}
                className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b-2 border-on-surface bg-surface-container-low cursor-pointer select-none hover:bg-surface-container transition-colors"
              >
                <Link
                  href={`/articles/${g.postSlug}`}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="min-w-0 font-headline-sm text-[15px] sm:text-headline-sm font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <span className="truncate">{g.postTitle}</span>
                  <Icon name="open_in_new" size={14} className="shrink-0 opacity-60" />
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono-code text-[10px] sm:text-label-sm font-bold px-2 py-0.5 rounded border-2 border-on-surface bg-surface-container-lowest text-on-surface">
                    {g.comments.length} {g.comments.length === 1 ? "comment" : "comments"}
                  </span>
                  <Icon name={open ? "expand_less" : "expand_more"} size={18} className="text-on-surface-variant" />
                </div>
              </div>
              {/* Thread cards */}
              {open && (
                <div className="p-3.5 sm:p-5 space-y-4">
                  {tree.map((node) => (
                    <CommentNode key={node._id} node={node} isRoot onLike={toggleLike} onReply={reply} onDelete={removeComment} onEdit={editComment} busyId={busyId} />
                  ))}
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
