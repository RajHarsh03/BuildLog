"use client";

import { signOut } from "next-auth/react";
import { Icon } from "@/components/shared/Icon";

/** Signs the admin out and returns to the login screen. */
export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono-code text-label-sm font-bold uppercase tracking-wider text-on-surface-variant rounded border-2 border-transparent hover:text-on-surface hover:border-on-surface hover:bg-surface-container transition-all"
    >
      <Icon name="logout" size={16} />
      <span>Sign out</span>
    </button>
  );
}
