"use client";

import { useEffect, useLayoutEffect, useState } from "react";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const STORAGE_KEY = "buildlog-font-size";
const MIN_ZOOM = -2;
const MAX_ZOOM = 2;

/** A-/A+ control that scales the article prose across five sizes. */
export function FontSizeToggle() {
  const [zoom, setZoom] = useState(0);

  // All sizing lives in globals.css keyed on <html data-font-size>, which
  // the article page also sets via a pre-paint inline script (no flash).
  const applyState = (clamped: number) => {
    if (clamped === 0) {
      document.documentElement.removeAttribute("data-font-size");
    } else {
      document.documentElement.setAttribute("data-font-size", String(clamped));
    }
  };

  // Keep React in sync with whatever the pre-paint script stored.
  useIsoLayoutEffect(() => {
    let saved = 0;
    try {
      saved = Number.parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10) || 0;
    } catch {
      saved = 0;
    }
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, saved));
    setZoom(clamped);
    applyState(clamped);
  }, []);

  const apply = (next: number) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    setZoom(clamped);
    try {
      localStorage.setItem(STORAGE_KEY, String(clamped));
    } catch {
      // Private-mode / disabled storage: zoom still works for this page.
    }
    applyState(clamped);
  };

  return (
    <div className="flex items-center bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[2px_2px_0px_0px_var(--color-ink)] p-0.5">
      <button
        className="fs-zoom-dec px-2 py-1 font-mono-code text-mono-code hover:bg-surface-container text-on-surface transition-colors"
        title="Decrease font size"
        type="button"
        onClick={() => apply(zoom - 1)}
      >
        A-
      </button>
      <span className="text-outline-variant px-0.5">|</span>
      <button
        className="fs-zoom-inc px-2 py-1 font-mono-code text-mono-code hover:bg-surface-container text-on-surface transition-colors"
        title="Increase font size"
        type="button"
        onClick={() => apply(zoom + 1)}
      >
        A+
      </button>
    </div>
  );
}
