"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  ariaLabel: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

/**
 * Custom brutalist select used across admin forms — same look as the public
 * article filter dropdowns. The list is intentionally NOT scrollable: option
 * sets here are short, so the panel always renders fully.
 */
export function SelectDropdown({ ariaLabel, value, options, onChange }: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside pointer-down or Escape.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex w-full items-center justify-between gap-1.5 pl-3 pr-2.5 py-2 font-mono-code text-[13px] font-semibold border-2 border-[var(--color-ink)] rounded shadow-[2px_2px_0px_var(--color-ink)] bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all cursor-pointer"
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <Icon name={open ? "expand_less" : "expand_more"} size={18} className="shrink-0" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-30 mt-1.5 w-full bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[3px_3px_0px_0px_var(--color-ink)] py-1"
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-1.5 font-mono-code text-[13px] transition-colors",
                  o.value === value
                    ? "bg-primary-container text-on-primary font-bold"
                    : "text-on-surface hover:bg-surface-container",
                )}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
