"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/shared/Icon";
import { useToast } from "@/components/shared/Toast";
import type { ProjectStatus } from "@/types/project";

interface ProjectRowActionsProps {
  id: string;
  status: ProjectStatus;
  featured: boolean;
}

const iconBtn =
  "p-1.5 rounded border-2 border-transparent text-on-surface-variant hover:text-on-surface hover:border-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-all";

/** Inline mutations for a project row: ship/activate, archive/restore, feature, edit, delete. */
export function ProjectRowActions({ id, status, featured }: ProjectRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();

  const isActive = status === "active";
  const isArchived = status === "archived";

  async function patch(body: Record<string, unknown>, message: string) {
    startTransition(async () => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      toast(res.ok ? message : "Action failed", res.ok ? "success" : "error");
      router.refresh();
    });
  }

  async function remove() {
    startTransition(async () => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      toast(res.ok ? "Project deleted" : "Delete failed", res.ok ? "success" : "error");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1 justify-end shrink-0">
      {/* While confirming, only the decision buttons remain — no overflow on phones. */}
      {!confirming && (
        <>
          <button
            type="button"
            title={isArchived ? "Restore to active (unarchive)" : isActive ? "Mark as shipped" : "Mark as active"}
            disabled={isPending}
            onClick={() =>
              patch(
                { status: isActive ? "shipped" : "active" },
                isArchived
                  ? "Project restored (active)"
                  : isActive
                    ? "Marked as shipped"
                    : "Set active",
              )
            }
            className={iconBtn}
          >
            <Icon
              name={isArchived ? "unarchive" : isActive ? "inventory_2" : "rocket_launch"}
              size={18}
            />
          </button>

          {!isArchived && (
            <button
              type="button"
              title="Archive (hide from public site)"
              disabled={isPending}
              onClick={() => patch({ status: "archived" }, "Project archived")}
              className={iconBtn}
            >
              <Icon name="archive" size={18} />
            </button>
          )}

          <button
            type="button"
            title={featured ? "Remove from featured" : "Mark as featured"}
            disabled={isPending}
            onClick={() =>
              patch(
                { featured: !featured },
                featured ? "Removed from featured" : "Marked as featured",
              )
            }
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
            href={`/admin/projects/${id}/edit`}
            title="Edit"
            className={iconBtn}
            aria-label="Edit project"
          >
            <Icon name="edit" size={18} />
          </Link>
        </>
      )}

      {confirming ? (
        <span className="flex items-center gap-1">
          <button
            type="button"
            disabled={isPending}
            onClick={remove}
            className="px-1.5 py-1 sm:px-2 font-mono-code text-[9px] sm:text-label-sm font-bold uppercase rounded border-2 border-on-surface bg-[#FEE2E2] text-[#991B1B] hover:shadow-[2px_2px_0px_0px_var(--color-ink)] transition-all"
          >
            Confirm
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirming(false)}
            className="px-1.5 py-1 sm:px-2 font-mono-code text-[9px] sm:text-label-sm font-bold uppercase rounded border-2 border-on-surface bg-surface-container-lowest text-on-surface-variant hover:shadow-[2px_2px_0px_0px_var(--color-ink)] transition-all"
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
