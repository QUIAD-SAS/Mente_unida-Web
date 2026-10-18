"use client";

import { FinanzasCommissionsTable } from "@/components/finanzas/finanzas-commissions-table";
import { FinanzasDateFilters } from "@/components/finanzas/finanzas-date-filters";
import { FinanzasRefundsTable } from "@/components/finanzas/finanzas-refunds-table";
import { FinanzasSectionPlaceholder } from "@/components/finanzas/finanzas-section-placeholder";
import { FinanzasSidebar } from "@/components/finanzas/finanzas-sidebar";
import { FinanzasStatCards } from "@/components/finanzas/finanzas-stat-cards";
import { downloadFinanzasReport } from "@/lib/admin/finanzas/api";
import { useFinanzasData } from "@/lib/admin/finanzas/queries";
import type { FinanzasFilters, FinanzasSection } from "@/lib/admin/finanzas/types";
import { useState } from "react";

const OVERVIEW_SECTIONS: FinanzasSection[] = [
  "income",
  "commissions",
  "payments",
  "refunds",
];

export function FinanzasView() {
  const [section, setSection] = useState<FinanzasSection>("income");
  const [filters, setFilters] = useState<FinanzasFilters>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data, isLoading, isError } = useFinanzasData(filters);

  async function handleDownloadPdf() {
    setFeedback(null);
    setIsDownloading(true);

    try {
      await downloadFinanzasReport(filters);
      setFeedback("Reporte PDF generado correctamente.");
    } catch {
      setFeedback(
        "La descarga de PDF estará disponible cuando se conecte el backend.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  const showOverview = OVERVIEW_SECTIONS.includes(section);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-mu-text">
          Finanzas
        </h1>
        <p className="mt-1 text-sm text-mu-text-muted">
          Administración de ingresos, comisiones y reembolsos de Mente Unida.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <FinanzasSidebar active={section} onChange={setSection} />

        <div className="min-w-0 space-y-6">
          {feedback ? (
            <p
              className="rounded-xl bg-mu-accent px-4 py-2.5 text-sm text-mu-text"
              role="status"
            >
              {feedback}
            </p>
          ) : null}

          {isError ? (
            <div className="rounded-xl border border-mu-error/30 bg-mu-error/5 px-4 py-3 text-sm text-mu-error">
              No se pudieron cargar los datos financieros.
            </div>
          ) : null}

          {showOverview ? (
            <>
              <FinanzasStatCards stats={data?.stats} isLoading={isLoading} />

              <FinanzasDateFilters
                filters={filters}
                onChange={setFilters}
                onDownloadPdf={() => void handleDownloadPdf()}
                isDownloading={isDownloading}
              />

              {(section === "income" || section === "commissions") && (
                <FinanzasCommissionsTable
                  commissions={data?.commissions}
                  isLoading={isLoading}
                />
              )}

              {(section === "refunds" || section === "payments") && (
                <FinanzasRefundsTable
                  refunds={data?.refunds}
                  isLoading={isLoading}
                />
              )}

              {section === "income" && (
                <FinanzasRefundsTable
                  refunds={data?.refunds}
                  isLoading={isLoading}
                />
              )}
            </>
          ) : (
            <FinanzasSectionPlaceholder section={section} />
          )}
        </div>
      </div>
    </div>
  );
}
