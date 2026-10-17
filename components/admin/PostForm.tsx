"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { MarkdownPreview } from "@/components/admin/MarkdownPreview";
import { SelectDropdown } from "@/components/admin/SelectDropdown";
import { cn } from "@/lib/utils";
import type { Post, PostStatus } from "@/types/post";

interface PostFormProps {
  /** When provided, the form edits this post; otherwise it creates a new one. */
  post?: Post;
}

const inputClass =
  "w-full px-3 py-2 bg-surface-container-lowest border-2 border-on-surface rounded font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:shadow-[3px_3px_0px_0px_var(--color-ink)] transition-shadow";
const labelClass =
  "block font-mono-code text-label-sm font-bold uppercase tracking-wider text-on-surface mb-1.5";

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription ?? "");
  const [seoImage, setSeoImage] = useState(post?.seoImage ?? "");

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submitLabel =
    status === "published" ? "Publish" : status === "archived" ? "Archive" : "Save draft";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !category.trim()) {
      setError("Title and category are required.");
      return;
    }

    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      category: category.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      coverImage: coverImage.trim(),
      status,
      featured,
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      seoImage: seoImage.trim(),
    };

    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/posts/${post!._id}` : "/api/posts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save post");
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-[#FEE2E2] border-2 border-[#991B1B] rounded text-[#991B1B] font-mono-code text-label-sm">
          <Icon name="error" size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: fields + editor */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <label className={labelClass} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What I learned shipping…"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="excerpt">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              className={cn(inputClass, "min-h-[80px] resize-y")}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A one or two sentence summary shown on cards."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="category">
                Category
              </label>
              <input
                id="category"
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Architecture"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="tags">
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                className={inputClass}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="node, postgres, caching"
              />
            </div>
          </div>

          {/* Content editor */}
          <div>
            <div className="flex flex-nowrap items-center justify-between gap-2 mb-1.5">
              <span className={cn(labelClass, "mb-0 truncate text-[10px] sm:text-label-sm")}>Content (MDX)</span>
              <div className="flex items-center gap-1 shrink-0">
                {(["write", "preview"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      "px-2 py-0.5 sm:px-2.5 sm:py-1 font-mono-code text-[9px] sm:text-label-sm font-bold uppercase rounded border-2 transition-all whitespace-nowrap",
                      tab === t
                        ? "bg-on-surface text-surface border-on-surface"
                        : "bg-surface-container-lowest text-on-surface-variant border-on-surface hover:text-on-surface",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {tab === "write" ? (
              <textarea
                className={cn(
                  inputClass,
                  "min-h-[420px] font-mono-code text-mono-code leading-relaxed resize-y",
                )}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"## Heading\n\nWrite in Markdown/MDX…\n\n```ts\nconst x = 1;\n```"}
                spellCheck={false}
              />
            ) : (
              <div className="border-2 border-on-surface rounded bg-surface-container-lowest shadow-[3px_3px_0px_0px_var(--color-ink)] min-h-[420px] max-h-[70vh] overflow-auto">
                <MarkdownPreview content={content} />
              </div>
            )}
          </div>
        </div>

        {/* Right: publish settings */}
        <aside className="lg:col-span-5 space-y-5">
          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] p-5 space-y-4">
            <h2 className="font-mono-code text-mono-code font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
              <Icon name="tune" size={18} />
              Publish
            </h2>

            <div>
              <label className={labelClass} htmlFor="status">
                Status
              </label>
              <SelectDropdown
                ariaLabel="Status"
                value={status}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                  { value: "archived", label: "Archived" },
                ]}
                onChange={(v) => setStatus(v as PostStatus)}
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="peer sr-only"
              />
              <span className="w-5 h-5 grid place-items-center rounded border-2 border-on-surface bg-surface-container-lowest text-transparent shadow-[2px_2px_0px_0px_var(--color-ink)] peer-checked:bg-mint-soft peer-checked:text-mint-ink peer-checked:shadow-none transition-all">
                <Icon name="check" size={14} weight={700} />
              </span>
              <span className="font-mono-code text-[13px] font-bold uppercase tracking-wider text-on-surface">
                Feature this post
              </span>
            </label>

            <div>
              <label className={labelClass} htmlFor="coverImage">
                Cover image URL
              </label>
              <input
                id="coverImage"
                className={inputClass}
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://…"
              />
            </div>

            <div className="grid grid-cols-2 items-center gap-2 sm:gap-3 pt-2">
              <Link
                href="/admin/posts"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 bg-surface-container-lowest text-on-surface-variant font-mono-code text-[10px] sm:text-label-md font-bold uppercase tracking-wider rounded border-2 border-on-surface hover:text-on-surface transition-all whitespace-nowrap"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 bg-primary-container text-on-primary font-mono-code text-[10px] sm:text-label-md font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {saving ? (
                  <Icon name="progress_activity" size={15} className="animate-spin" />
                ) : (
                  <Icon name="save" size={15} />
                )}
                <span>{saving ? "Saving…" : submitLabel}</span>
              </button>
            </div>
          </div>

          {/* SEO */}
          <details className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] p-5 group">
            <summary className="cursor-pointer list-none font-mono-code text-mono-code font-bold uppercase tracking-wider text-on-surface flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Icon name="search" size={18} />
                SEO overrides
              </span>
              <Icon
                name="expand_more"
                size={20}
                className="group-open:rotate-180 transition-transform"
              />
            </summary>
            <div className="space-y-4 mt-4">
              <div>
                <label className={labelClass} htmlFor="seoTitle">
                  Meta title
                </label>
                <input
                  id="seoTitle"
                  className={inputClass}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Defaults to the post title"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="seoDescription">
                  Meta description
                </label>
                <textarea
                  id="seoDescription"
                  className={cn(inputClass, "min-h-[70px] resize-y")}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Defaults to the excerpt"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="seoImage">
                  Social image URL
                </label>
                <input
                  id="seoImage"
                  className={inputClass}
                  value={seoImage}
                  onChange={(e) => setSeoImage(e.target.value)}
                  placeholder="Defaults to the cover image"
                />
              </div>
            </div>
          </details>
        </aside>
      </div>
    </form>
  );
}
