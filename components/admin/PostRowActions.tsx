"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/shared/Icon";
import type { PostStatus } from "@/types/post";

interface PostRowActionsProps {
  id: string;
  status: PostStatus;
  featured: boolean;
}

const iconBtn =
  "p-1.5 rounded border-2 border-transparent text-on-surface-variant hover:text-on-surface hover:border-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-all";

/** Inline mutations for a post row: publish/unpublish, feature, edit, delete. */
export function PostRowActions({ id, status, featured }: PostRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const isPublished = status === "published";

  async function patch(body: Record<string, unknown>) {
    startTransition(async () => {
      await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    });
  }

  async function remove() {
    startTransition(async () => {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        title={isPublished ? "Unpublish (move to draft)" : "Publish"}
        disabled={isPending}
        onClick={() => patch({ status: isPublished ? "draft" : "published" })}
        className={iconBtn}
      >
        <Icon name={isPublished ? "visibility_off" : "public"} size={18} />
      </button>

      <button
        type="button"
        title={featured ? "Remove from featured" : "Mark as featured"}
        disabled={isPending}
        onClick={() => patch({ featured: !featured })}
        className={iconBtn}
      >
        <Icon
          name={featured ? "star" : "star_border"}
          fill={featured}
          size={18}
          className={featured ? "text-[#92400E]" : undefined}
        />
      </button>

      <Link
        href={`/admin/posts/${id}/edit`}
        title="Edit"
        className={iconBtn}
        aria-label="Edit post"
      >
        <Icon name="edit" size={18} />
      </Link>

      {confirming ? (
        <span className="flex items-center gap-1 ml-1">
          <button
            type="button"
            disabled={isPending}
            onClick={remove}
            className="px-2 py-1 font-mono-code text-label-sm font-bold uppercase rounded border-2 border-on-surface bg-[#FEE2E2] text-[#991B1B] hover:shadow-[2px_2px_0px_0px_var(--color-ink)] transition-all"
          >
            Confirm
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirming(false)}
            className="px-2 py-1 font-mono-code text-label-sm font-bold uppercase rounded border-2 border-on-surface bg-surface-container-lowest text-on-surface-variant hover:shadow-[2px_2px_0px_0px_var(--color-ink)] transition-all"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          title="Delete"
          disabled={isPending}
          onClick={() => setConfirming(true)}
          className={`${iconBtn} hover:text-[#991B1B]`}
        >
          <Icon name="delete" size={18} />
        </button>
      )}
    </div>
  );
}
