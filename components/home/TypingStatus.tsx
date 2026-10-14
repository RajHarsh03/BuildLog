"use client";

import { useEffect, useState } from "react";

/** Typing cadence (ms) — deliberately uneven-feeling via hold vs delete. */
const TYPE_MS = 72;
const DELETE_MS = 34;
const HOLD_MS = 2400;
const GAP_MS = 420;

/**
 * Rotating typewriter for the hero terminal's `status` value. Renders the
 * green string + orange block cursor so the terminal line stays markup-free.
 */
export function TypingStatus({ phrases }: { phrases: string[] }) {
  const [index, setIndex] = useState(0);
  const [chars, setChars] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) return;
    const current = phrases[index % phrases.length];

    let timer: ReturnType<typeof setTimeout>;
    if (!deleting && chars < current.length) {
      timer = setTimeout(() => setChars(chars + 1), TYPE_MS);
    } else if (!deleting) {
      timer = setTimeout(() => setDeleting(true), HOLD_MS);
    } else if (chars > 0) {
      timer = setTimeout(() => setChars(chars - 1), DELETE_MS);
    } else {
      timer = setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      }, GAP_MS);
    }
    return () => clearTimeout(timer);
  }, [chars, deleting, index, phrases]);

  const current = phrases.length ? phrases[index % phrases.length] : "";
  const typed = current.slice(0, chars);
  const done = !deleting && chars === current.length;

  return (
    <span className="text-[#34D399]">
      &quot;{typed}
      {done && <>&quot;</>}
      <span className="inline-block w-2 h-4 bg-[#FB923C] animate-pulse align-middle ml-0.5" />
    </span>
  );
}
