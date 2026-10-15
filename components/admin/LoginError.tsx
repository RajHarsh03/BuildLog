"use client";

import { useEffect } from "react";
import { Icon } from "@/components/shared/Icon";

/**
 * Shows the unauthorized error banner once, then strips the `error` query
 * param from the URL so a page reload no longer re-triggers it.
 */
export function LoginError({ error }: { error?: string }) {
  useEffect(() => {
    if (error) {
      window.history.replaceState(null, "", "/login");
    }
  }, [error]);

  if (error !== "Unauthorized") return null;

  return (
    <div className="w-full bg-error-container border-2 border-on-error-container rounded-lg p-3 flex items-start gap-2 text-left">
      <Icon name="lock" size={18} className="mt-0.5 shrink-0 text-on-error-container" />
      <p className="font-body-md text-body-md text-on-error-container">
        Not authorized to access dashboard.
      </p>
    </div>
  );
}
