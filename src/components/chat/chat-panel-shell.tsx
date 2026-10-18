"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

interface ChatPanelShellProps {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

/**
 * Contenedor fijo de chat: header arriba, scroll en el centro, input abajo.
 * Usa CSS Grid para que la fila central no colapse cuando llegan mensajes o typing.
 */
export function ChatPanelShell({
  header,
  children,
  footer,
  className,
  style,
  "aria-label": ariaLabel,
}: ChatPanelShellProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-mu border border-mu-border bg-mu-surface shadow-xl",
        className,
      )}
      style={style}
      role="dialog"
      aria-label={ariaLabel}
    >
      <div
        className="grid h-full w-full overflow-hidden"
        style={{ gridTemplateRows: "auto minmax(0, 1fr) auto" }}
      >
        <header className="min-w-0 border-b border-mu-border bg-mu-background">
          {header}
        </header>

        <div className="min-h-0 min-w-0 overflow-hidden">{children}</div>

        <footer className="min-w-0 shrink-0 border-t border-mu-border bg-mu-surface">
          {footer}
        </footer>
      </div>
    </div>
  );
}
