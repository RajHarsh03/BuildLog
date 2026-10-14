import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
  /** Optical size in px, applied as an inline font-size (matches prototype usage). */
  size?: number;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
}

/** Thin wrapper around a Material Symbols Outlined glyph. */
export function Icon({ name, className, size, weight }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontSize: size ? `${size}px` : undefined,
        fontVariationSettings: weight ? `'wght' ${weight}` : undefined,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
