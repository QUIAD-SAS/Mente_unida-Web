"use client";

import { AdminAuthGate } from "@/components/admin/admin-auth-gate";
import { DashboardShell } from "@/components/admin/dashboard-shell";
import { SessionProvider } from "@/lib/auth/session-context";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AdminAuthGate>
        <DashboardShell>{children}</DashboardShell>
      </AdminAuthGate>
    </SessionProvider>
  );
}
