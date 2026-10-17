import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Material Symbols glyph shown in the icon chip. */
  icon?: string;
  /** Monospace eyebrow label, e.g. "JOURNAL // EMPTY". */
  label: string;
  title: string;
  description?: string;
  action?: { href: string; label: string; icon?: string };
  className?: string;
}

/**
 * Neo-brutalist empty state: ink-bordered card with an icon chip, mono
 * eyebrow, serif title and optional action button. Token-driven, so it
 * inverts with dark mode automatically.
 */
export function EmptyState({
  icon = "inbox",
  label,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] p-8 sm:p-10 text-center",
        className,
      )}
    >
      <div className="inline-flex items-center justify-center w-12 h-12 bg-surface-container border-2 border-on-surface rounded-md shadow-[2px_2px_0px_0px_var(--color-ink)] mb-4">
        <Icon name={icon} size={24} weight={600} />
      </div>
      <p className="font-mono-code text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
        {label}
      </p>
      <p className="font-headline-md text-headline-md text-on-surface font-semibold">{title}</p>
      {description && (
        <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-surface-container-lowest text-on-surface font-mono-code text-mono-code font-bold uppercase tracking-wider border-2 border-on-surface rounded-md shadow-[2px_2px_0px_0px_var(--color-ink)] nb-press"
        >
          <span>{action.label}</span>
          {action.icon && <Icon name={action.icon} size={16} />}
        </Link>
      )}
    </div>
  );
}
