"use client";

import { ModeracionActionDialog } from "@/components/moderacion/moderacion-action-dialog";
import { ModeracionDetailPanel } from "@/components/moderacion/moderacion-detail-panel";
import { ModeracionFiltersBar } from "@/components/moderacion/moderacion-filters";
import { ModeracionTable } from "@/components/moderacion/moderacion-table";
import {
  useModerationAction,
  useModerationItem,
  useModerationItems,
} from "@/lib/admin/moderacion/queries";
import type {
  ModerationFilters,
  ModerationListItem,
} from "@/lib/admin/moderacion/types";
import { useMemo, useState } from "react";

type DialogMode = "approve" | "delete" | "hide" | "warn" | null;

export function ModeracionView() {
  const [filters, setFilters] = useState<ModerationFilters>({
    reason: "all",
    status: "all",
    aiOnly: false,
    search: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [dialogItem, setDialogItem] = useState<ModerationListItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data, isLoading, isError } = useModerationItems(filters);
  const detailQuery = useModerationItem(selectedId);
  const actionMutation = useModerationAction(dialogItem?.id ?? selectedId);

  const selectedListItem = useMemo(
    () => data?.items.find((i) => i.id === selectedId) ?? null,
    [data?.items, selectedId],
  );

  function openDialog(mode: DialogMode, item?: ModerationListItem) {
    setDialogMode(mode);
    setDialogItem(item ?? selectedListItem);
  }

  function closeDialog() {
    setDialogMode(null);
    setDialogItem(null);
  }

  function findItem(id: string) {
    return data?.items.find((i) => i.id === id);
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
          Moderación
        </h1>
        <p className="mt-1 text-sm text-mu-text-muted">
          Control de contenido sensible detectado por reportes e IA.
        </p>
      </div>

      <ModeracionFiltersBar filters={filters} onChange={setFilters} />

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
          No se pudieron cargar los casos de moderación.
        </div>
      ) : null}

      <ModeracionTable
        items={data?.items}
        isLoading={isLoading}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onApprove={(id) => {
          const item = findItem(id);
          if (item) openDialog("approve", item);
        }}
        onDelete={(id) => {
          const item = findItem(id);
          if (item) openDialog("delete", item);
        }}
        onHide={(id) => {
          const item = findItem(id);
          if (item) openDialog("hide", item);
        }}
        onWarn={(id) => {
          const item = findItem(id);
          if (item) openDialog("warn", item);
        }}
      />

      <ModeracionDetailPanel
        open={Boolean(selectedId)}
        item={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        onClose={() => setSelectedId(null)}
        onApprove={() => openDialog("approve")}
        onDelete={() => openDialog("delete")}
        onHide={() => openDialog("hide")}
        onWarn={() => openDialog("warn")}
      />

      <ModeracionActionDialog
        mode={dialogMode}
        item={dialogItem}
        isPending={actionMutation.isPending}
        onClose={closeDialog}
        onApprove={() =>
          runAction(
            () => actionMutation.mutateAsync({ type: "approve" }),
            "Publicación aprobada. Acción auditada.",
          )
        }
        onDelete={() =>
          runAction(
            () => actionMutation.mutateAsync({ type: "delete" }),
            "Publicación eliminada. Acción auditada.",
          )
        }
        onHide={() =>
          runAction(
            () => actionMutation.mutateAsync({ type: "hide" }),
            "Publicación ocultada. Acción auditada.",
          )
        }
        onWarn={(message) =>
          runAction(
            () => actionMutation.mutateAsync({ type: "warn", message }),
            "Advertencia enviada. Acción auditada.",
          )
        }
      />
    </div>
  );
}
