"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

export const THEME_STORAGE_KEY = "buildlog-theme";

/**
 * Dark/light toggle. Persists the choice to localStorage and flips the
 * `dark` class on <html>; the inline script in the root layout restores it
 * before first paint so the theme survives reloads without a flash.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  // Sync with whatever the pre-paint script applied (also keeps tabs in sync).
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark")),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Private-mode storage failures shouldn't break the toggle.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      className="p-2 bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_0px_var(--color-ink)] rounded-lg text-on-surface hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center"
    >
      {/* Single glyph driven by state so only one icon is ever rendered. */}
      <Icon name={dark ? "light_mode" : "dark_mode"} size={20} weight={600} />
    </button>
  );
}
