"use client";

import { AlertsPanel } from "@/components/admin/alerts-panel";
import { PatientsTable } from "@/components/admin/patients-table";
import { RequestsTable } from "@/components/admin/requests-table";
import { StatCardsGrid } from "@/components/admin/stat-cards-grid";
import { WeeklyActivityChart } from "@/components/admin/weekly-activity-chart";
import { useDashboardHome } from "@/lib/admin/dashboard/queries";

export function DashboardHomeView() {
  const { data, isLoading, isError } = useDashboardHome();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-mu-text">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-mu-text-muted">
          Resumen operativo de Mente Unida
        </p>
      </div>

      {isError ? (
        <div className="rounded-xl border border-mu-error/30 bg-mu-error/5 px-4 py-3 text-sm text-mu-error">
          No se pudo cargar la información del dashboard. Intenta recargar la
          página.
        </div>
      ) : null}

      <StatCardsGrid stats={data?.stats} isLoading={isLoading} />

      <WeeklyActivityChart data={data?.weeklyActivity} isLoading={isLoading} />

      <div className="grid gap-6 xl:grid-cols-2">
        <PatientsTable patients={data?.recentPatients} isLoading={isLoading} />
        <RequestsTable requests={data?.recentRequests} isLoading={isLoading} />
      </div>

      <AlertsPanel alerts={data?.alerts} isLoading={isLoading} />
    </div>
  );
}
