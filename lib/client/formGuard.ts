"use client";

let dirty = false;
const listeners = new Set<() => void>();

/** Active form's DB draft-saver, registered on mount, cleared on unmount. */
type DraftSaver = () => Promise<boolean>;
let draftSaver: DraftSaver | null = null;

export function registerDraftSaver(fn: DraftSaver | null) {
  draftSaver = fn;
}

/**
 * Runs the active form's DB draft save (used by the admin nav's
 * "save draft & leave"). Resolves true = draft saved, false = failed/skipped,
 * null = no form registered (plain page, nothing to save).
 */
export async function runDraftSaver(): Promise<boolean | null> {
  if (!draftSaver) return null;
  try {
    return await draftSaver();
  } catch {
    return false;
  }
}

export function setFormDirty(value: boolean) {
  if (dirty === value) return;
  dirty = value;
  listeners.forEach((fn) => fn());
}

export function isFormDirty(): boolean {
  return dirty;
}

export function subscribeFormDirty(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
