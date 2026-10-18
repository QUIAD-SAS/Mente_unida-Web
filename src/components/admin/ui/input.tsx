import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border bg-white px-3 text-sm text-mu-text transition-colors",
          "placeholder:text-mu-text-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mu-primary/30",
          error
            ? "border-mu-error focus-visible:ring-mu-error/30"
            : "border-mu-border",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
