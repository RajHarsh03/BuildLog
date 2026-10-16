"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Icon } from "@/components/shared/Icon";
import type { AboutContent, JourneyItem, SkillGroup } from "@/types/about";

interface AboutFormProps {
  initial: AboutContent;
}

const inputClass =
  "w-full px-3 py-2 bg-surface-container-lowest border-2 border-on-surface rounded font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:shadow-[3px_3px_0px_0px_var(--color-ink)] transition-shadow";
const labelClass =
  "block font-mono-code text-label-sm font-bold uppercase tracking-wider text-on-surface mb-1.5";
const cardClass =
  "bg-surface-container-lowest border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] rounded-lg p-5 space-y-4";
const ghostBtnClass =
  "inline-flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] rounded font-mono-code text-[13px] font-bold text-on-surface hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all";

let keySeed = 0;
const nextKey = () => `new-${Date.now()}-${keySeed++}`;

type JourneyRow = JourneyItem & { key: string };
type SkillRow = SkillGroup & { key: string };

/** Dashboard editor for the public About page (intro, journey, skills). */
export function AboutForm({ initial }: AboutFormProps) {
  const router = useRouter();
  const [intro, setIntro] = useState(initial.intro);
  const [journey, setJourney] = useState<JourneyRow[]>(
    initial.journey.map((j) => ({ ...j, key: nextKey() })),
  );
  const [skills, setSkills] = useState<SkillRow[]>(
    initial.skills.map((s) => ({ ...s, items: [...s.items], key: nextKey() })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const starredCount = journey.filter((j) => j.featured).length;

  function patchJourney(key: string, patch: Partial<JourneyItem>) {
    setJourney((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function patchSkill(key: string, patch: Partial<SkillGroup>) {
    setSkills((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const payload = {
      intro: intro.trim(),
      journey: journey.map(({ year, title, body, featured }) => ({
        year: year.trim(),
        title: title.trim(),
        body: body.trim(),
        featured,
      })),
      skills: skills.map(({ group, icon, items }) => ({
        group: group.trim(),
        icon: icon.trim() || "build",
        items: items.map((i) => i.trim()).filter(Boolean),
      })),
    };

    setSaving(true);
    try {
      const res = await fetch("/api/about", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save about content");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
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
      {saved && !error && (
        <div className="flex items-center gap-2 p-3 bg-mint-soft border-2 border-on-surface rounded text-on-surface font-mono-code text-label-sm">
          <Icon name="check_circle" size={16} />
          Saved. The public About page refreshes within seconds.
        </div>
      )}

      {/* Intro */}
      <div className={cardClass}>
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Intro</h2>
        <div>
          <label className={labelClass} htmlFor="intro">
            About paragraph
          </label>
          <textarea
            id="intro"
            className={clsx(inputClass, "min-h-[120px] resize-y")}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="Who you are and what you build."
          />
        </div>
      </div>

      {/* Journey */}
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Journey milestones
            </h2>
            <p className="font-mono-code text-label-sm text-on-surface-variant mt-1">
              Starred milestones appear on the About page (max 4 shown, newest win).
            </p>
          </div>
          <span
            className={clsx(
              "font-mono-code text-label-sm font-bold px-2.5 py-1 rounded border-2 border-on-surface",
              starredCount > 4
                ? "bg-[#FEE2E2] text-[#991B1B]"
                : "bg-surface-container text-on-surface",
            )}
          >
            {starredCount}/4 starred
          </span>
        </div>

        <div className="space-y-4">
          {journey.map((j) => (
            <div
              key={j.key}
              className="grid grid-cols-[auto_110px_1fr_auto] gap-3 items-start p-3 bg-surface-container-lowest border-2 border-on-surface/20 rounded"
            >
              <button
                type="button"
                title={j.featured ? "Unstar (hide from About page)" : "Star (show on About page)"}
                onClick={() => patchJourney(j.key, { featured: !j.featured })}
                className="p-1.5 hover:bg-surface-container rounded transition-colors"
              >
                <Icon
                  name={j.featured ? "star" : "star_border"}
                  fill={j.featured}
                  size={22}
                  className={j.featured ? "text-badge-amber-ink" : "text-on-surface-variant"}
                />
              </button>
              <div className="space-y-2">
                <input
                  className={inputClass}
                  value={j.year}
                  onChange={(e) => patchJourney(j.key, { year: e.target.value })}
                  placeholder="2026"
                  aria-label="Year"
                />
              </div>
              <div className="space-y-2">
                <input
                  className={inputClass}
                  value={j.title}
                  onChange={(e) => patchJourney(j.key, { title: e.target.value })}
                  placeholder="Milestone title"
                  aria-label="Title"
                />
                <textarea
                  className={clsx(inputClass, "min-h-[70px] resize-y")}
                  value={j.body}
                  onChange={(e) => patchJourney(j.key, { body: e.target.value })}
                  placeholder="What happened this year?"
                  aria-label="Description"
                />
              </div>
              <button
                type="button"
                title="Remove milestone"
                onClick={() => setJourney((rows) => rows.filter((r) => r.key !== j.key))}
                className="p-1.5 text-on-surface-variant hover:text-[#991B1B] hover:bg-[#FEE2E2] rounded transition-colors"
              >
                <Icon name="delete" size={20} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className={ghostBtnClass}
          onClick={() =>
            setJourney((rows) => [
              ...rows,
              { key: nextKey(), year: "", title: "", body: "", featured: false },
            ])
          }
        >
          <Icon name="add" size={16} />
          Add milestone
        </button>
      </div>

      {/* Skills */}
      <div className={cardClass}>
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Skills toolbox
          </h2>
          <p className="font-mono-code text-label-sm text-on-surface-variant mt-1">
            Groups shown on the About page. Items are comma-separated. Icon names are Material
            Symbols (code, database, web, cloud, build...).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {skills.map((s) => (
            <div
              key={s.key}
              className="space-y-2 p-3 bg-surface-container-lowest border-2 border-on-surface/20 rounded"
            >
              <div className="grid grid-cols-[1fr_130px_auto] gap-2">
                <input
                  className={inputClass}
                  value={s.group}
                  onChange={(e) => patchSkill(s.key, { group: e.target.value })}
                  placeholder="Group name"
                  aria-label="Group name"
                />
                <input
                  className={inputClass}
                  value={s.icon}
                  onChange={(e) => patchSkill(s.key, { icon: e.target.value })}
                  placeholder="icon"
                  aria-label="Icon name"
                />
                <button
                  type="button"
                  title="Remove group"
                  onClick={() => setSkills((rows) => rows.filter((r) => r.key !== s.key))}
                  className="p-1.5 self-center text-on-surface-variant hover:text-[#991B1B] hover:bg-[#FEE2E2] rounded transition-colors"
                >
                  <Icon name="delete" size={20} />
                </button>
              </div>
              <input
                className={inputClass}
                value={s.items.join(", ")}
                onChange={(e) =>
                  patchSkill(s.key, { items: e.target.value.split(",") })
                }
                placeholder="TypeScript, Go, Rust"
                aria-label="Skills (comma-separated)"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className={ghostBtnClass}
          onClick={() =>
            setSkills((rows) => [
              ...rows,
              { key: nextKey(), group: "", icon: "build", items: [] },
            ])
          }
        >
          <Icon name="add" size={16} />
          Add group
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !intro.trim()}
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary-container text-on-primary-container font-mono-code text-label-md font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          <Icon name={saving ? "hourglass_top" : "save"} size={18} />
          <span>{saving ? "Saving..." : "Save about page"}</span>
        </button>
      </div>
    </form>
  );
}
