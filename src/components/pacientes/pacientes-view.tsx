"use client";

import {
  AddNoteDialog,
  PacienteActionDialog,
} from "@/components/pacientes/paciente-action-dialog";
import { PacientesDetailPanel } from "@/components/pacientes/pacientes-detail-panel";
import { PacientesFiltersBar } from "@/components/pacientes/pacientes-filters";
import { PacientesTable } from "@/components/pacientes/pacientes-table";
import {
  paginateItems,
  type TablePageSize,
} from "@/components/admin/ui/table-pagination";
import {
  usePatient,
  usePatientAction,
  usePatients,
  useUpdatePatient,
} from "@/lib/admin/pacientes/queries";
import type {
  PatientDetailTab,
  PatientFilters,
  PatientListItem,
} from "@/lib/admin/pacientes/types";
import { useEffect, useMemo, useState } from "react";

type DialogMode = "edit" | "password" | null;

interface PacientesViewProps {
  embedded?: boolean;
}

export function PacientesView({ embedded = false }: PacientesViewProps) {
  const [filters, setFilters] = useState<PatientFilters>({
    status: "all",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<TablePageSize>(15);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PatientDetailTab>("info");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [dialogPatient, setDialogPatient] = useState<PatientListItem | null>(
    null,
  );
  const [showAddNote, setShowAddNote] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data, isLoading, isError } = usePatients(filters);
  const detailQuery = usePatient(selectedId);
  const updateMutation = useUpdatePatient(dialogPatient?.id ?? selectedId);
  const actionMutation = usePatientAction(
    dialogPatient?.id ?? selectedId,
  );

  const allPatients = data?.patients ?? [];
  const { items: paginatedPatients, safePage } = useMemo(
    () => paginateItems(allPatients, page, pageSize),
    [allPatients, page, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.search, pageSize]);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const selectedListPatient = useMemo(
    () => allPatients.find((p) => p.id === selectedId) ?? null,
    [allPatients, selectedId],
  );

  function openDialog(mode: DialogMode, patient?: PatientListItem) {
    setDialogMode(mode);
    setDialogPatient(patient ?? selectedListPatient);
  }

  function closeDialog() {
    setDialogMode(null);
    setDialogPatient(null);
  }

  async function handleEdit(form: {
    name: string;
    email: string;
    phone: string;
    emergencyContact: string;
    isActive: boolean;
  }) {
    try {
      await updateMutation.mutateAsync(form);
      setFeedback("Paciente actualizado correctamente.");
      closeDialog();
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo actualizar",
      );
    }
  }

  async function handleChangePassword(password: string) {
    try {
      await actionMutation.mutateAsync({ type: "change_password", password });
      setFeedback("Contraseña actualizada correctamente.");
      closeDialog();
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo cambiar la contraseña",
      );
    }
  }

  async function handleAddNote(note: string) {
    try {
      await actionMutation.mutateAsync({ type: "add_note", note });
      setFeedback("Nota agregada correctamente.");
      setShowAddNote(false);
      setActiveTab("notes");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo agregar la nota",
      );
    }
  }

  return (
    <div className="space-y-6">
      {!embedded ? (
        <div>
          <h1 className="font-heading text-2xl font-semibold text-mu-text">
            Pacientes
          </h1>
          <p className="mt-1 text-sm text-mu-text-muted">
            Gestión de pacientes registrados en la plataforma.
          </p>
        </div>
      ) : null}

      <PacientesFiltersBar filters={filters} onChange={setFilters} />

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
          No se pudieron cargar los pacientes. Intenta recargar la página.
        </div>
      ) : null}

      <PacientesTable
        patients={paginatedPatients}
        isLoading={isLoading}
        selectedId={selectedId}
        page={safePage}
        pageSize={pageSize}
        total={allPatients.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onView={(id) => {
          setSelectedId(id);
          setActiveTab("info");
        }}
        onEdit={(patient) => openDialog("edit", patient)}
        onChangePassword={(id) => {
          const patient = allPatients.find((p) => p.id === id);
          if (patient) openDialog("password", patient);
        }}
      />

      <PacientesDetailPanel
        open={Boolean(selectedId)}
        detail={detailQuery.data}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={() => setSelectedId(null)}
        onEdit={() => {
          if (selectedListPatient) openDialog("edit", selectedListPatient);
        }}
        onAddNote={() => setShowAddNote(true)}
      />

      <PacienteActionDialog
        mode={dialogMode}
        patient={dialogPatient}
        isPending={updateMutation.isPending || actionMutation.isPending}
        onClose={closeDialog}
        onEdit={handleEdit}
        onChangePassword={handleChangePassword}
      />

      <AddNoteDialog
        open={showAddNote}
        onClose={() => setShowAddNote(false)}
        onSubmit={handleAddNote}
        isPending={actionMutation.isPending}
      />
    </div>
  );
}
