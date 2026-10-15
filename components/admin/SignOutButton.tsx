"use client";

import { signOut } from "next-auth/react";
import { Icon } from "@/components/shared/Icon";
import { clsx } from "clsx";

/** Signs the admin out and returns to the login screen. */
export function SignOutButton({
  onSignedOut,
  fullWidth = false,
}: {
  /** e.g. close the avatar menu while the redirect happens. */
  onSignedOut?: () => void;
  /** Stretch to the menu width when used inside the account dropdown. */
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onSignedOut?.();
        void signOut({ callbackUrl: "/login" });
      }}
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_0px_var(--color-ink)] rounded-lg font-mono-code text-[13px] font-bold text-on-surface hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all",
        fullWidth && "w-full justify-center",
      )}
    >
      <Icon name="logout" size={18} weight={600} />
      <span>Sign out</span>
    </button>
  );
}
