"use client";

import { PsicologoActionDialog } from "@/components/psicologos/psicologo-action-dialog";
import { PsicologosDetailPanel } from "@/components/psicologos/psicologos-detail-panel";
import { PsicologosFiltersBar } from "@/components/psicologos/psicologos-filters";
import { PsicologosTable } from "@/components/psicologos/psicologos-table";
import {
  paginateItems,
  type TablePageSize,
} from "@/components/admin/ui/table-pagination";
import {
  usePsychologist,
  usePsychologistAction,
  usePsychologists,
  useUpdatePsychologist,
} from "@/lib/admin/psicologos/queries";
import type {
  PsychologistDetailTab,
  PsychologistFilters,
  PsychologistListItem,
} from "@/lib/admin/psicologos/types";
import { useEffect, useMemo, useState } from "react";

type DialogMode = "edit" | "password" | null;

interface PsicologosViewProps {
  embedded?: boolean;
}

export function PsicologosView({ embedded = false }: PsicologosViewProps) {
  const [filters, setFilters] = useState<PsychologistFilters>({
    status: "all",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<TablePageSize>(15);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PsychologistDetailTab>("rethus");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [dialogPsychologist, setDialogPsychologist] =
    useState<PsychologistListItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data, isLoading, isError } = usePsychologists(filters);
  const detailQuery = usePsychologist(selectedId);
  const editProfileQuery = usePsychologist(
    dialogMode === "edit" && dialogPsychologist?.id
      ? dialogPsychologist.id
      : null,
  );
  const updateMutation = useUpdatePsychologist(
    dialogPsychologist?.id ?? selectedId,
  );
  const actionMutation = usePsychologistAction(
    dialogPsychologist?.id ?? selectedId,
  );

  const allPsychologists = data?.psychologists ?? [];
  const { items: paginatedPsychologists, safePage } = useMemo(
    () => paginateItems(allPsychologists, page, pageSize),
    [allPsychologists, page, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.search, pageSize]);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const selectedListItem = useMemo(
    () => allPsychologists.find((p) => p.id === selectedId) ?? null,
    [allPsychologists, selectedId],
  );

  function openDialog(mode: DialogMode, psychologist?: PsychologistListItem) {
    setDialogMode(mode);
    setDialogPsychologist(psychologist ?? selectedListItem);
  }

  function closeDialog() {
    setDialogMode(null);
    setDialogPsychologist(null);
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
      {!embedded ? (
        <div>
          <h1 className="font-heading text-2xl font-semibold text-mu-text">
            Psicólogos
          </h1>
          <p className="mt-1 text-sm text-mu-text-muted">
            Directorio y gestión de profesionales de salud mental.
          </p>
        </div>
      ) : null}

      <PsicologosFiltersBar filters={filters} onChange={setFilters} />

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
          No se pudieron cargar los psicólogos. Intenta recargar la página.
        </div>
      ) : null}

      <PsicologosTable
        psychologists={paginatedPsychologists}
        isLoading={isLoading}
        selectedId={selectedId}
        page={safePage}
        pageSize={pageSize}
        total={allPsychologists.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onView={(id) => {
          setSelectedId(id);
          setActiveTab("rethus");
        }}
        onEdit={(p) => openDialog("edit", p)}
        onChangePassword={(id) => {
          const p = allPsychologists.find((item) => item.id === id);
          if (p) openDialog("password", p);
        }}
      />

      <PsicologosDetailPanel
        open={Boolean(selectedId)}
        detail={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={() => setSelectedId(null)}
        onEdit={() => {
          if (selectedListItem) openDialog("edit", selectedListItem);
        }}
      />

      <PsicologoActionDialog
        mode={dialogMode}
        psychologist={dialogPsychologist}
        profile={editProfileQuery.data?.psychologist}
        isLoadingProfile={editProfileQuery.isLoading}
        isPending={updateMutation.isPending || actionMutation.isPending}
        onClose={closeDialog}
        onEdit={(form) =>
          runAction(() => updateMutation.mutateAsync(form), "Psicólogo actualizado.")
        }
        onChangePassword={(password) =>
          runAction(
            () => actionMutation.mutateAsync({ type: "change_password", password }),
            "Contraseña actualizada correctamente.",
          )
        }
      />
    </div>
  );
}
