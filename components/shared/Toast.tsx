"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastApi {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Access the global toast. Safe no-op if used outside the provider. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  return useMemo(() => ctx ?? { toast: () => {} }, [ctx]);
}

const STYLES: Record<ToastType, { icon: string; iconClass: string }> = {
  success: { icon: "check_circle", iconClass: "text-tertiary" },
  error: { icon: "error", iconClass: "text-error" },
  info: { icon: "info", iconClass: "text-secondary" },
};

const AUTO_DISMISS_MS = 2800;
const MAX_STACK = 4;

/**
 * Site-wide brutalist toast system — same visual language as the share
 * toast: ink border, hard offset shadow, mono text, slide-up entrance.
 * Mounted once in the root layout; call useToast().toast(...) anywhere.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback(
    (id: number) => setItems((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = ++idRef.current;
      setItems((prev) => [...prev.slice(-(MAX_STACK - 1)), { id, message, type }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="hidden sm:flex fixed bottom-4 right-4 z-[100] flex-col-reverse gap-2 pointer-events-none max-w-[calc(100vw-2rem)]"
      >
        {items.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => dismiss(t.id)}
            className={cn(
              "toast-in pointer-events-auto flex items-center gap-2 px-4 py-2.5 text-left",
              "bg-surface-container-lowest border-2 border-[var(--color-ink)] rounded-lg",
              "shadow-[4px_4px_0px_0px_var(--color-ink)]",
              "font-mono-code text-mono-code font-bold text-on-surface",
            )}
          >
            <Icon
              name={STYLES[t.type].icon}
              size={17}
              weight={600}
              className={cn("shrink-0", STYLES[t.type].iconClass)}
            />
            <span>{t.message}</span>
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
