"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/shared/Toast";

/** sessionStorage key holding the greeted identity; cleared on sign-out so a
 * fresh sign-in toasts again (admin or public), even in the same tab. */
export const SIGNED_IN_FLAG = "buildlog-signed-in-as";

/**
 * Fires a single "Signed in as {name}" toast per browser session, anywhere
 * the session exists — covers the admin OAuth landing and readers who sign
 * in with GitHub from a comment section and return to the article.
 * Mounted once in the root layout; reads the session client-side so it
 * never forces the public pages dynamic.
 */
export function SessionWelcome() {
  const { toast } = useToast();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        const name = (s as { user?: { name?: string | null } } | null)?.user?.name;
        if (!name) return;
        try {
          // Greet once per identity: re-signing after a sign-out toasts again.
          if (sessionStorage.getItem(SIGNED_IN_FLAG) === name) return;
          sessionStorage.setItem(SIGNED_IN_FLAG, name);
        } catch {
          /* storage disabled: greet anyway */
        }
        toast(`Signed in as ${name}`, "info");
      })
      .catch(() => {});
  }, [toast]);

  return null;
}
