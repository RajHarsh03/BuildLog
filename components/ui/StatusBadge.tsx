import { cn } from "@/lib/utils";

type Status = "active" | "shipped" | "archived" | "draft" | "published";

const STATUS_STYLES: Record<Status, string> = {
  active: "bg-mint-soft text-mint-ink",
  published: "bg-mint-soft text-mint-ink",
  shipped: "bg-[#E0E7FF] text-[#1E40AF]",
  archived: "bg-surface-variant text-on-surface-variant",
  draft: "bg-[#FEF3C7] text-[#92400E]",
};

interface StatusBadgeProps {
  status: Status;
  label?: string;
  version?: string;
  pulse?: boolean;
  className?: string;
  /** "sm" = compact chip for dense card headers. */
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, version, pulse, className, size = "md" }: StatusBadgeProps) {
  const showPulse = pulse ?? status === "active";
  const dot = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono-code uppercase font-bold rounded border-2 border-[var(--color-ink)]",
        size === "sm"
          ? "gap-1 px-2 py-0.5 text-[10px]"
          : "gap-1.5 px-2.5 py-1 text-label-sm",
        STATUS_STYLES[status],
        className,
      )}
    >
      {showPulse && (
        <span className={cn("relative flex", dot)}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
          <span className={cn("relative inline-flex rounded-full bg-mint", dot)} />
        </span>
      )}
      <span>
        {label ?? status}
        {version ? ` • ${version}` : ""}
      </span>
    </span>
  );
}
