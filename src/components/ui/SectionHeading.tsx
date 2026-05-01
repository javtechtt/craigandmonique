import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        isCenter ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span
          className="text-xs font-medium uppercase tracking-[0.32em]"
          style={{ color: "var(--color-gold)" }}
        >
          {eyebrow}
        </span>
      ) : null}

      <h2
        className="font-serif text-3xl leading-tight sm:text-4xl md:text-5xl"
        style={{ color: "var(--color-charcoal)" }}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base font-light leading-relaxed sm:text-lg",
            isCenter ? "mx-auto" : null,
          )}
          style={{ color: "var(--color-sage-dark)" }}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default SectionHeading;
