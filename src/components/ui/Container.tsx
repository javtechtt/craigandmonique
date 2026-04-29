import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ContainerSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

type ContainerProps<T extends ElementType> = {
  as?: T;
  size?: ContainerSize;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Container<T extends ElementType = "div">({
  as,
  size = "lg",
  className,
  children,
  ...rest
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn("mx-auto w-full px-6 sm:px-8", sizeClasses[size], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Container;
