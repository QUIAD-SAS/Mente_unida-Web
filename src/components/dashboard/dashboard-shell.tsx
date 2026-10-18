"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type DashboardRole = "patient" | "psychologist";

interface DashboardShellProps {
  role: DashboardRole;
  children: ReactNode;
  /** Sin scroll en main; útil para vistas con paneles internos (ej. mensajes). */
  contained?: boolean;
  className?: string;
  mainClassName?: string;
}

export function DashboardShell({
  role,
  children,
  contained = false,
  className,
  mainClassName,
}: DashboardShellProps) {
  return (
    <div className={cn("flex h-full min-h-0 overflow-hidden", className)}>
      <DashboardSidebar role={role} />
      <main
        className={cn(
          "min-h-0 min-w-0 flex-1",
          contained
            ? "flex h-full min-h-0 flex-col overflow-hidden"
            : "h-full overflow-y-auto overscroll-contain",
          "p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8",
          mainClassName,
        )}
      >
        {children}
      </main>
    </div>
  );
}
