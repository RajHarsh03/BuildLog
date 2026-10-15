import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
  /** Optical size in px, applied as an inline font-size (matches prototype usage). */
  size?: number;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** Fill the glyph solid (Material Symbols 'FILL' variation axis). */
  fill?: boolean;
}

/** Thin wrapper around a Material Symbols Outlined glyph. */
export function Icon({ name, className, size, weight, fill }: IconProps) {
  const settings = [
    weight ? `'wght' ${weight}` : null,
    fill ? "'FILL' 1" : null,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontSize: size ? `${size}px` : undefined,
        fontVariationSettings: settings || undefined,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
