import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 font-mono-code font-bold uppercase tracking-wider border-2 border-on-surface transition-all",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-container text-on-primary shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        ink: "bg-on-surface text-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        secondary:
          "bg-surface-container-lowest text-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        ghost:
          "bg-transparent text-on-surface border-transparent shadow-none hover:bg-surface-container hover:border-on-surface normal-case tracking-normal",
      },
      size: {
        sm: "px-3 py-1.5 text-label-sm",
        md: "px-4 py-2.5 text-mono-code",
        lg: "px-6 py-3 text-mono-code",
      },
      rounded: {
        none: "rounded",
        lg: "rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md", rounded: "none" },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonStyles>;

interface BaseProps extends ButtonVariantProps {
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = BaseProps & { href: string; external?: boolean };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { children, className, variant, size, rounded } = props;
  const classes = cn(buttonStyles({ variant, size, rounded }), className);

  if ("href" in props && props.href) {
    const { href, external } = props;
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const { children: _c, className: _cl, variant: _v, size: _s, rounded: _r, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
