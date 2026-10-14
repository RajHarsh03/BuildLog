"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";

/** MVP newsletter callout — no email provider wired yet, so it just acknowledges. */
export function NewsletterForm() {
  const [state, setState] = useState<"idle" | "done">("idle");

  return (
    <div className="lg:col-span-5 flex flex-col space-y-3">
      <form
        className="flex flex-col sm:flex-row gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setState("done");
        }}
      >
        <input
          aria-label="Email address"
          className="w-full px-4 py-3 bg-surface-container-lowest border-2 border-on-surface text-on-surface font-mono-code text-mono-code placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-on-surface rounded shadow-[2px_2px_0px_0px_var(--color-ink)]"
          placeholder="you@domain.com"
          required
          type="email"
        />
        <button
          className={`px-6 py-3 font-mono-code text-mono-code font-bold uppercase tracking-wider border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all shrink-0 ${
            state === "done"
              ? "bg-tertiary-container text-on-tertiary-container"
              : "bg-primary-container text-on-primary"
          }`}
          type="submit"
        >
          {state === "done" ? "Subscribed!" : "Subscribe"}
        </button>
      </form>
      <div className="flex items-center gap-3 font-mono-code text-xs text-on-surface-variant pt-1">
        <span className="flex items-center gap-1">
          <Icon name="check_circle" size={14} className="text-tertiary" />
          <span>MIT Licensed Code</span>
        </span>
      </div>
    </div>
  );
}
