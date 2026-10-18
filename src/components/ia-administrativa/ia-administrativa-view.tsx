"use client";

import { IaActionDialog } from "@/components/ia-administrativa/ia-action-dialog";
import { IaAlertsTable } from "@/components/ia-administrativa/ia-alerts-table";
import { IaDetailPanel } from "@/components/ia-administrativa/ia-detail-panel";
import { IaFiltersBar } from "@/components/ia-administrativa/ia-filters";
import { IaStatCards } from "@/components/ia-administrativa/ia-stat-cards";
import {
  useIaAction,
  useIaAdministrativa,
  useIaAlert,
} from "@/lib/admin/ia-administrativa/queries";
import type { IaAlertListItem, IaFilters } from "@/lib/admin/ia-administrativa/types";
import { useMemo, useState } from "react";

type DialogMode = "review" | "ignore" | "approve" | "escalate" | null;

export function IaAdministrativaView() {
  const [filters, setFilters] = useState<IaFilters>({
    type: "all",
    status: "all",
    search: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [dialogAlert, setDialogAlert] = useState<IaAlertListItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data, isLoading, isError } = useIaAdministrativa(filters);
  const detailQuery = useIaAlert(selectedId);
  const actionMutation = useIaAction(dialogAlert?.id ?? selectedId);

  const selectedListItem = useMemo(
    () => data?.alerts.find((a) => a.id === selectedId) ?? null,
    [data?.alerts, selectedId],
  );

  function openDialog(mode: DialogMode, alert?: IaAlertListItem) {
    setDialogMode(mode);
    setDialogAlert(alert ?? selectedListItem);
  }

  function closeDialog() {
    setDialogMode(null);
    setDialogAlert(null);
  }

  function findAlert(id: string) {
    return data?.alerts.find((a) => a.id === id);
  }

  async function runAction(
    type: DialogMode,
    successMessage: string,
  ) {
    if (!type) return;

    try {
      await actionMutation.mutateAsync({ type });
      setFeedback(successMessage);
      closeDialog();
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo completar la acción",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-mu-text">
          IA Administrativa
        </h1>
        <p className="mt-1 text-sm text-mu-text-muted">
          Asistencia inteligente para el equipo administrativo. Solo sugiere, no
          decide.
        </p>
      </div>

      <IaStatCards
        stats={data?.stats}
        isLoading={isLoading}
        activeType={filters.type === "all" ? undefined : filters.type}
        onTypeClick={(type) => setFilters({ ...filters, type })}
      />

      <IaFiltersBar filters={filters} onChange={setFilters} />

      {feedback ? (
        <p
          className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700"
          role="status"
        >
          {feedback}
        </p>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-mu-error/30 bg-mu-error/5 px-4 py-3 text-sm text-mu-error">
          No se pudieron cargar las alertas de IA.
        </div>
      ) : null}

      <IaAlertsTable
        alerts={data?.alerts}
        isLoading={isLoading}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onReview={(id) => {
          const alert = findAlert(id);
          if (alert) openDialog("review", alert);
        }}
        onIgnore={(id) => {
          const alert = findAlert(id);
          if (alert) openDialog("ignore", alert);
        }}
        onApprove={(id) => {
          const alert = findAlert(id);
          if (alert) openDialog("approve", alert);
        }}
        onEscalate={(id) => {
          const alert = findAlert(id);
          if (alert) openDialog("escalate", alert);
        }}
      />

      <IaDetailPanel
        open={Boolean(selectedId)}
        alert={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        onClose={() => setSelectedId(null)}
        onReview={() => openDialog("review")}
        onIgnore={() => openDialog("ignore")}
        onApprove={() => openDialog("approve")}
        onEscalate={() => openDialog("escalate")}
      />

      <IaActionDialog
        mode={dialogMode}
        alert={dialogAlert}
        isPending={actionMutation.isPending}
        onClose={closeDialog}
        onReview={() =>
          runAction("review", "Alerta marcada como revisada.")
        }
        onIgnore={() =>
          runAction("ignore", "Sugerencia ignorada.")
        }
        onApprove={() =>
          runAction("approve", "Sugerencia aprobada por el administrador.")
        }
        onEscalate={() =>
          runAction("escalate", "Alerta escalada al equipo correspondiente.")
        }
      />
    </div>
  );
}
