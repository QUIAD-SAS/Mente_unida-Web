import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

const variants = {
  default: "bg-mu-accent text-mu-primary",
  verified: "bg-mu-success/15 text-mu-success",
  pending: "bg-mu-warning/15 text-amber-800",
  error: "bg-mu-error/15 text-mu-error",
  muted: "bg-mu-border/50 text-mu-text-muted",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
