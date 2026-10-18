"use client";

import { SolicitudActionDialog } from "@/components/solicitudes/solicitud-action-dialog";
import { SolicitudesDetailPanel } from "@/components/solicitudes/solicitudes-detail-panel";
import { SolicitudesFiltersBar } from "@/components/solicitudes/solicitudes-filters";
import { SolicitudesTable } from "@/components/solicitudes/solicitudes-table";
import {
  useSolicitud,
  useSolicitudAction,
  useSolicitudes,
} from "@/lib/admin/solicitudes/queries";
import type {
  SolicitudFilters,
  SolicitudListItem,
} from "@/lib/admin/solicitudes/types";
import { useMemo, useState } from "react";

type DialogMode =
  | "approve"
  | "reject"
  | "request_info"
  | "require_supervisor"
  | null;

export function SolicitudesView() {
  const [filters, setFilters] = useState<SolicitudFilters>({
    status: "all",
    search: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [dialogRequest, setDialogRequest] = useState<SolicitudListItem | null>(
    null,
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data, isLoading, isError } = useSolicitudes(filters);
  const detailQuery = useSolicitud(selectedId);
  const actionMutation = useSolicitudAction(
    dialogRequest?.id ?? selectedId,
  );

  const selectedListItem = useMemo(
    () => data?.requests.find((r) => r.id === selectedId) ?? null,
    [data?.requests, selectedId],
  );

  function openDialog(mode: DialogMode, request?: SolicitudListItem) {
    setDialogMode(mode);
    setDialogRequest(request ?? selectedListItem);
  }

  function closeDialog() {
    setDialogMode(null);
    setDialogRequest(null);
  }

  async function runAction(
    fn: () => Promise<unknown>,
    successMessage: string,
  ) {
    try {
      await fn();
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
          Solicitudes Profesionales
        </h1>
        <p className="mt-1 text-sm text-mu-text-muted">
          Revisión de nuevos registros de psicólogos en la plataforma.
        </p>
      </div>

      <SolicitudesFiltersBar filters={filters} onChange={setFilters} />

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
          No se pudieron cargar las solicitudes. Intenta recargar la página.
        </div>
      ) : null}

      <SolicitudesTable
        requests={data?.requests}
        isLoading={isLoading}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <SolicitudesDetailPanel
        open={Boolean(selectedId)}
        detail={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        onClose={() => setSelectedId(null)}
        onApprove={() => openDialog("approve")}
        onReject={() => openDialog("reject")}
        onRequestInfo={() => openDialog("request_info")}
        onRequireSupervisor={() => openDialog("require_supervisor")}
      />

      <SolicitudActionDialog
        mode={dialogMode}
        request={dialogRequest}
        isPending={actionMutation.isPending}
        onClose={closeDialog}
        onApprove={() =>
          runAction(
            () => actionMutation.mutateAsync({ type: "approve" }),
            "Solicitud aprobada. Notificación enviada al solicitante.",
          )
        }
        onReject={() =>
          runAction(
            () => actionMutation.mutateAsync({ type: "reject" }),
            "Solicitud rechazada. Notificación enviada al solicitante.",
          )
        }
        onRequestInfo={(message) =>
          runAction(
            () => actionMutation.mutateAsync({ type: "request_info", message }),
            "Solicitud de información enviada.",
          )
        }
        onRequireSupervisor={() =>
          runAction(
            () => actionMutation.mutateAsync({ type: "require_supervisor" }),
            "Supervisión requerida registrada. Notificación enviada.",
          )
        }
      />
    </div>
  );
}
