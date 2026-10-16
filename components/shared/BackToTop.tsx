"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

/**
 * Floating circular "back to top" button. Appears after the reader scrolls
 * past the first screenful; mounted once in the public site layout so every
 * page gets it.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      aria-label="Back to top"
      title="Back to top"
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-container text-on-primary border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-y-[-2px] hover:shadow-[4px_5px_0px_0px_var(--color-ink)] active:translate-y-[2px] active:shadow-none transition-all ${
        show ? "opacity-100" : "opacity-0 pointer-events-none translate-y-3"
      }`}
    >
      <Icon name="arrow_upward" size={18} weight={700} />
    </button>
  );
}
