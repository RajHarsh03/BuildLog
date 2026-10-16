import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeStyles = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap font-mono-code text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-[var(--color-ink)]",
  {
    variants: {
      tone: {
        blue: "bg-[#E0E7FF] text-[#1E40AF]",
        amber: "bg-[#FEF3C7] text-[#92400E]",
        red: "bg-[#FEE2E2] text-[#991B1B]",
        cyan: "bg-[#CFFAFE] text-[#155E75]",
        pink: "bg-[#FCE7F3] text-[#9D174D]",
        mint: "bg-mint-soft text-mint-ink",
        neutral: "bg-surface-container text-on-surface",
        ink: "bg-on-surface text-surface-container-lowest",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

interface BadgeProps extends VariantProps<typeof badgeStyles> {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, tone, className }: BadgeProps) {
  return <span className={cn(badgeStyles({ tone }), className)}>{children}</span>;
}

/** Map an arbitrary category string to a stable badge tone. */
export function toneForCategory(category: string): VariantProps<typeof badgeStyles>["tone"] {
  const c = category.toLowerCase();
  if (c.includes("web")) return "mint";
  if (c.includes("devops") || c.includes("sec")) return "red";
  if (c.includes("ai") || c.includes("ml")) return "cyan";
  if (c.includes("career") || c.includes("philosophy")) return "amber";
  if (c.includes("project")) return "blue";
  if (c.includes("network")) return "pink";
  if (c.includes("database") || c.includes("tool")) return "blue";
  return "blue";
}
