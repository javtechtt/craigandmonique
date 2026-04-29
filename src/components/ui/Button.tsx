import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs uppercase tracking-[0.24em]",
  md: "h-11 px-6 text-sm uppercase tracking-[0.28em]",
  lg: "h-12 px-8 text-sm uppercase tracking-[0.32em]",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[color:var(--color-sage-dark)] text-[color:var(--color-cream)] hover:bg-[color:var(--color-charcoal)] focus-visible:ring-[color:var(--color-sage-dark)]",
  secondary:
    "border border-[color:var(--color-sage-dark)] text-[color:var(--color-sage-dark)] hover:bg-[color:var(--color-sage-dark)] hover:text-[color:var(--color-cream)] focus-visible:ring-[color:var(--color-sage-dark)]",
  ghost:
    "text-[color:var(--color-charcoal)] hover:text-[color:var(--color-gold)] focus-visible:ring-[color:var(--color-gold)]",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
};

type AnchorProps = CommonProps & {
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;

type NativeButtonProps = CommonProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export type ButtonProps = AnchorProps | NativeButtonProps;

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(baseClasses, sizeClasses[size], variantClasses[variant], className);

  if ("href" in props && props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    void _v;
    void _s;
    void _c;
    void _ch;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
  void _v;
  void _s;
  void _c;
  void _ch;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

export default Button;
