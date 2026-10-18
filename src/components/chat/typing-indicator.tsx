import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  label?: string;
  compact?: boolean;
  className?: string;
}

export function TypingIndicator({
  label = "Escribiendo",
  compact = false,
  className,
}: TypingIndicatorProps) {
  return (
    <div
      className={cn("flex shrink-0 items-center gap-2 py-1", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex items-center gap-1 rounded-mu bg-mu-accent px-3 py-2">
        <span className="sr-only">{label}</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-mu-text-muted"
            style={{ animationDelay: `${i * 150}ms` }}
            aria-hidden
          />
        ))}
      </div>
      {label && !compact ? (
        <span className="min-w-0 truncate text-xs text-mu-text-muted">
          {label}
        </span>
      ) : null}
    </div>
  );
}
