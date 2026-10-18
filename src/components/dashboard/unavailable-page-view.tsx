"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getDashboardPath, useAuthStore } from "@/lib/auth/store";
import { AlertCircle } from "lucide-react";

interface UnavailablePageViewProps {
  role: "patient" | "psychologist";
  section: string;
}

export function UnavailablePageView({
  role,
  section,
}: UnavailablePageViewProps) {
  const user = useAuthStore((s) => s.user);
  const dashboardPath = getDashboardPath(
    user?.roles ?? [user?.role ?? "PATIENT"],
  );

  return (
    <DashboardShell role={role} mainClassName="flex items-center justify-center">
      <Card className="max-w-md p-8 text-center">
          <AlertCircle
            className="mx-auto h-12 w-12 text-mu-warning"
            aria-hidden
          />
          <CardTitle className="mt-4 text-xl">Página no disponible</CardTitle>
          <CardDescription className="mt-2 text-base">
            <strong>{section}</strong> estará disponible próximamente. Tu sesión
            sigue activa.
          </CardDescription>
          <Button className="mt-6" href={dashboardPath}>
            Volver a mi espacio
          </Button>
        </Card>
    </DashboardShell>
  );
}
