"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/shared/Toast";

/** localStorage key holding the greeted identity. localStorage (not session)
 * so closing/reopening the browser with a live session does NOT re-greet —
 * the toast fires only on a real sign-in, and sign-out clears this to arm it
 * for the next one. */
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
          // Greet once per sign-in event: a returning visit with the same
          // stored identity stays silent until the next real sign-in.
          if (localStorage.getItem(SIGNED_IN_FLAG) === name) return;
          localStorage.setItem(SIGNED_IN_FLAG, name);
        } catch {
          /* storage disabled: greet anyway */
        }
        toast(`Signed in as ${name}`, "info");
      })
      .catch(() => {});
  }, [toast]);

  return null;
}
