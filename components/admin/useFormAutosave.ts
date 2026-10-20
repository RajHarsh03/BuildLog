"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isFormDirty, setFormDirty } from "@/lib/client/formGuard";

const AUTOSAVE_DEBOUNCE_MS = 700;

interface AutosaveFile<T> {
  values: T;
  savedAt: number;
}

export function useFormAutosave<T extends Record<string, unknown>>({
  storageKey,
  values,
  onRestore,
}: {
  storageKey: string;
  values: T;
  onRestore: (saved: Partial<T>) => void;
}) {
  const [restored, setRestored] = useState(false);
  const mounted = useRef(false);

  // Restore once per key on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as AutosaveFile<T>;
        if (parsed && typeof parsed.savedAt === "number" && parsed.values) {
          onRestore(parsed.values as Partial<T>);
          setRestored(true);
        }
      }
    } catch {
      /* corrupted/disabled storage: start fresh */
    }
    mounted.current = true;
    // Unmount = form gone; clear the global dirty flag.
    return () => setFormDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Debounced autosave + dirty flag on every change after mount.
  useEffect(() => {
    if (!mounted.current) return;
    setFormDirty(true);
    const t = setTimeout(() => {
      try {
        const file: AutosaveFile<T> = { values, savedAt: Date.now() };
        localStorage.setItem(storageKey, JSON.stringify(file));
      } catch {
        /* storage full/disabled: best-effort only */
      }
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [values, storageKey]);

  // Native prompt for refresh / tab close while dirty.
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty()) e.preventDefault();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  const clearAutosave = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setFormDirty(false);
  }, [storageKey]);

  const discardAutosave = useCallback(() => {
    clearAutosave();
    setRestored(false);
  }, [clearAutosave]);

  return { restored, clearAutosave, discardAutosave };
}
