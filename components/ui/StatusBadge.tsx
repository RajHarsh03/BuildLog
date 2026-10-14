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
}

export function StatusBadge({ status, label, version, pulse, className }: StatusBadgeProps) {
  const showPulse = pulse ?? status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 font-mono-code text-label-sm uppercase font-bold rounded border-2 border-[var(--color-ink)]",
        STATUS_STYLES[status],
        className,
      )}
    >
      {showPulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
        </span>
      )}
      <span>
        {label ?? status}
        {version ? ` • ${version}` : ""}
      </span>
    </span>
  );
}
