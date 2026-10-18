"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { MarkdownPreview } from "@/components/admin/MarkdownPreview";
import { PublishDateField, toDateInputValue } from "@/components/admin/PublishDateField";
import { useToast } from "@/components/shared/Toast";
import { SelectDropdown } from "@/components/admin/SelectDropdown";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types/project";

interface ProjectFormProps {
  /** When provided, the form edits this project; otherwise it creates a new one. */
  project?: Project;
}

const inputClass =
  "w-full px-3 py-2 bg-surface-container-lowest border-2 border-on-surface rounded font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:shadow-[3px_3px_0px_0px_var(--color-ink)] transition-shadow";
const labelClass =
  "block font-mono-code text-label-sm font-bold uppercase tracking-wider text-on-surface mb-1.5";

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(project);

  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [technologies, setTechnologies] = useState(
    (project?.technologies ?? []).join(", "),
  );
  const [image, setImage] = useState(project?.image ?? "");
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [content, setContent] = useState(project?.content ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "active");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [publishDate, setPublishDate] = useState(toDateInputValue(project?.publishedAt));

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      content,
      technologies: technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      image: image.trim(),
      githubUrl: githubUrl.trim(),
      liveUrl: liveUrl.trim(),
      status,
      featured,
      // Noon keeps the picked calendar day stable across timezones.
      ...(publishDate ? { publishedAt: new Date(`${publishDate}T12:00:00`).toISOString() } : {}),
    };

    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/projects/${project!._id}` : "/api/projects",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save project");
      toast(
        status === "shipped" ? "Project shipped" : status === "archived" ? "Project archived" : "Project saved",
      );
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      toast((err as Error).message, "error");
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
            <label className={labelClass} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="AI Code Reviewer"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className={cn(inputClass, "min-h-[90px] resize-y")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short summary of what this project does."
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="technologies">
              Technologies (comma-separated)
            </label>
            <input
              id="technologies"
              className={inputClass}
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="Next.js, MongoDB, OpenAI"
            />
          </div>

          {/* Case-study editor */}
          <div>
            <div className="flex flex-nowrap items-center justify-between gap-2 mb-1.5">
              <span className={cn(labelClass, "mb-0 truncate text-[10px] sm:text-label-sm")}>Case study (MDX)</span>
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
                  "min-h-[360px] font-mono-code text-mono-code leading-relaxed resize-y",
                )}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"Optional. Write a full case study in MDX…"}
                spellCheck={false}
              />
            ) : (
              <div className="border-2 border-on-surface rounded bg-surface-container-lowest shadow-[3px_3px_0px_0px_var(--color-ink)] min-h-[360px] max-h-[70vh] overflow-auto">
                <MarkdownPreview content={content} />
              </div>
            )}
          </div>
        </div>

        {/* Right: settings */}
        <aside className="lg:col-span-5 space-y-5">
          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] p-5 space-y-4">
            <h2 className="font-mono-code text-mono-code font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
              <Icon name="tune" size={18} />
              Settings
            </h2>

            <div>
              <label className={labelClass} htmlFor="status">
                Status
              </label>
              <SelectDropdown
                ariaLabel="Status"
                value={status}
                options={[
                  { value: "active", label: "Active" },
                  { value: "shipped", label: "Shipped" },
                  { value: "archived", label: "Archived" },
                ]}
                onChange={(v) => setStatus(v as ProjectStatus)}
              />
            </div>

            <PublishDateField
              id="publishDate"
              value={publishDate}
              onChange={setPublishDate}
              hint="Back-date the build or pick Today — empty keeps the existing date."
            />

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
                Feature this project
              </span>
            </label>

            <div>
              <label className={labelClass} htmlFor="image">
                Image URL
              </label>
              <input
                id="image"
                className={inputClass}
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://…"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="githubUrl">
                GitHub URL
              </label>
              <input
                id="githubUrl"
                className={inputClass}
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/…"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="liveUrl">
                Live URL
              </label>
              <input
                id="liveUrl"
                className={inputClass}
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>

            <div className="grid grid-cols-2 items-center gap-2 sm:gap-3 pt-2">
              <Link
                href="/admin/projects"
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
                <span>{saving ? "Saving…" : "Save project"}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
