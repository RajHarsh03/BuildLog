"use client";

import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full px-3 py-2 bg-surface-container-lowest border-2 border-on-surface rounded font-mono-code text-mono-code text-on-surface focus:outline-none focus:shadow-[3px_3px_0px_0px_var(--color-ink)] transition-shadow";
const labelClass =
  "block font-mono-code text-label-sm font-bold uppercase tracking-wider text-on-surface mb-1.5";

/** yyyy-MM-dd for <input type="date"> from an ISO timestamp (empty when none). */
export function toDateInputValue(iso?: string): string {
  return iso ? iso.slice(0, 10) : "";
}

/** Today's local date as yyyy-MM-dd. */
export function todayInputValue(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface PublishDateFieldProps {
  id: string;
  /** yyyy-MM-dd or "" (empty = auto: keep existing / publish-now). */
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}

/**
 * Publish-date row used by the admin post/project forms: a date input plus a
 * "Today" shortcut that stamps the current date. The chosen date becomes the
 * entry's publishedAt (and creation date), so back-dated content sorts and
 * displays as if it shipped that day.
 */
export function PublishDateField({ id, value, onChange, hint }: PublishDateFieldProps) {
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        Publish date
      </label>
      <div className="flex items-stretch gap-2">
        <input
          id={id}
          type="date"
          className={cn(inputClass, "flex-1 min-w-0")}
          value={value}
          max={todayInputValue()}
          onChange={(e) => {
            // `max` only greys the picker; typed dates must be clamped too
            // (yyyy-MM-dd compares correctly as plain strings).
            const today = todayInputValue();
            onChange(e.target.value && e.target.value > today ? today : e.target.value);
          }}
        />
        <button
          type="button"
          onClick={() => onChange(todayInputValue())}
          className="inline-flex items-center gap-1.5 px-3 bg-surface-container text-on-surface font-mono-code text-label-sm font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all whitespace-nowrap"
        >
          <Icon name="today" size={14} />
          Today
        </button>
      </div>
      <p className="font-mono-code text-[11px] text-on-surface-variant mt-1.5">
        {hint ?? "Back-date a post or pick Today — future dates aren't allowed; empty keeps the existing date."}
      </p>
    </div>
  );
}
