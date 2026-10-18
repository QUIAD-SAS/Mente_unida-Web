"use client";

import { AuditoriaDetailPanel } from "@/components/auditoria/auditoria-detail-panel";
import { AuditoriaFiltersBar } from "@/components/auditoria/auditoria-filters";
import { AuditoriaTable } from "@/components/auditoria/auditoria-table";
import { useAuditLog, useAuditLogs } from "@/lib/admin/auditoria/queries";
import type { AuditFilters } from "@/lib/admin/auditoria/types";
import { useState } from "react";

export function AuditoriaView() {
  const [filters, setFilters] = useState<AuditFilters>({
    module: "all",
    search: "",
    user: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isError } = useAuditLogs(filters);
  const detailQuery = useAuditLog(selectedId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-mu-text">
          Auditoría
        </h1>
        <p className="mt-1 text-sm text-mu-text-muted">
          Registro de acciones y trazabilidad del sistema. Solo lectura.
        </p>
      </div>

      <AuditoriaFiltersBar filters={filters} onChange={setFilters} />

      {isError ? (
        <div className="rounded-xl border border-mu-error/30 bg-mu-error/5 px-4 py-3 text-sm text-mu-error">
          No se pudieron cargar los registros de auditoría.
        </div>
      ) : null}

      <AuditoriaTable
        logs={data?.logs}
        isLoading={isLoading}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <AuditoriaDetailPanel
        open={Boolean(selectedId)}
        log={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
