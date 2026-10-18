import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[96px] w-full rounded-xl border bg-white px-3 py-2 text-sm text-mu-text transition-colors",
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

Textarea.displayName = "Textarea";
