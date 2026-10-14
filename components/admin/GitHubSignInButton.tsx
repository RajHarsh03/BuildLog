"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Icon } from "@/components/shared/Icon";

/**
 * Client-side GitHub sign-in. Uses `next-auth/react`'s `signIn` helper so the
 * button works without a server action, then bounces to the admin dashboard.
 */
export function GitHubSignInButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        void signIn("github", { callbackUrl: "/admin" });
      }}
      className="inline-flex items-center justify-center gap-2.5 w-full px-6 py-3.5 bg-on-surface text-surface font-mono-code text-mono-code font-bold uppercase tracking-wider rounded-lg border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Icon name="progress_activity" size={20} className="animate-spin" />
      ) : (
        <Icon name="key" size={20} />
      )}
      <span>{loading ? "Redirecting…" : "Sign in with GitHub"}</span>
    </button>
  );
}
