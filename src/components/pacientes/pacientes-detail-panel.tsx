"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Skeleton } from "@/components/admin/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import {
  PATIENT_DETAIL_TABS,
  PATIENT_STATUS_LABELS,
  patientStatusVariant,
} from "@/lib/admin/pacientes/labels";
import type { PatientDetail, PatientDetailTab } from "@/lib/admin/pacientes/types";
import { cn } from "@/lib/utils";
import { Pencil, StickyNote, X } from "lucide-react";

interface PacientesDetailPanelProps {
  open: boolean;
  detail?: PatientDetail;
  isLoading?: boolean;
  isError?: boolean;
  activeTab: PatientDetailTab;
  onTabChange: (tab: PatientDetailTab) => void;
  onClose: () => void;
  onEdit: () => void;
  onAddNote: () => void;
}

export function PacientesDetailPanel({
  open,
  detail,
  isLoading,
  isError,
  activeTab,
  onTabChange,
  onClose,
  onEdit,
  onAddNote,
}: PacientesDetailPanelProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-mu-border bg-white shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Detalle del paciente"
        aria-hidden={!open}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-mu-border px-5">
          <h2 className="font-heading text-base font-semibold text-mu-text">
            Detalle del paciente
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-mu-text-muted hover:bg-mu-accent"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 space-y-4 p-5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError || !detail ? (
          <div className="flex flex-1 items-center justify-center p-5 text-sm text-mu-text-muted">
            No se pudo cargar el detalle del paciente.
          </div>
        ) : (
          <>
            <div className="shrink-0 border-b border-mu-border px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-mu-text">
                    {detail.patient.alias}
                  </p>
                  <p className="text-sm text-mu-text-muted">
                    {detail.patient.name}
                  </p>
                </div>
                <Badge variant={patientStatusVariant(detail.patient.status)}>
                  {PATIENT_STATUS_LABELS[detail.patient.status]}
                </Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onAddNote}>
                  <StickyNote className="h-3.5 w-3.5" />
                  Agregar nota
                </Button>
              </div>
            </div>

            <div className="shrink-0 overflow-x-auto border-b border-mu-border px-2">
              <div className="flex min-w-max gap-1 py-2">
                {PATIENT_DETAIL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                      activeTab === tab.id
                        ? "bg-mu-primary text-white"
                        : "text-mu-text-muted hover:bg-mu-accent",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === "info" && <InfoTab detail={detail} />}
              {activeTab === "appointments" && (
                <AppointmentsTab appointments={detail.appointments} />
              )}
              {activeTab === "subscription" && (
                <SubscriptionTab subscription={detail.subscription} />
              )}
              {activeTab === "payments" && <PaymentsTab payments={detail.payments} />}
              {activeTab === "notes" && <NotesTab notes={detail.notes} />}
              {activeTab === "audit" && <AuditTab audit={detail.audit} />}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function InfoTab({ detail }: { detail: PatientDetail }) {
  const { patient } = detail;
  const fields = [
    { label: "Alias", value: patient.alias },
    { label: "Nombre", value: patient.name },
    { label: "Correo", value: patient.email },
    { label: "Teléfono", value: patient.phone },
    { label: "Contacto emergencia", value: patient.emergencyContact },
    { label: "Registro", value: formatDate(patient.registeredAt) },
  ];

  return (
    <dl className="space-y-4">
      {fields.map((field) => (
        <div key={field.label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
            {field.label}
          </dt>
          <dd className="mt-1 text-sm text-mu-text">{field.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function AppointmentsTab({
  appointments,
}: {
  appointments: PatientDetail["appointments"];
}) {
  if (appointments.length === 0) {
    return <EmptyTab message="Sin citas registradas" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Psicólogo</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appt) => (
          <TableRow key={appt.id}>
            <TableCell>{appt.psychologistName}</TableCell>
            <TableCell className="text-mu-text-muted">
              {formatDateTime(appt.date)}
            </TableCell>
            <TableCell>{appt.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SubscriptionTab({
  subscription,
}: {
  subscription: PatientDetail["subscription"];
}) {
  if (!subscription) {
    return <EmptyTab message="Sin suscripción activa" />;
  }

  return (
    <dl className="space-y-4">
      <InfoField label="Plan" value={subscription.plan} />
      <InfoField label="Estado" value={subscription.status} />
      <InfoField label="Inicio" value={formatDate(subscription.startDate)} />
      {subscription.endDate ? (
        <InfoField label="Fin" value={formatDate(subscription.endDate)} />
      ) : null}
    </dl>
  );
}

function PaymentsTab({ payments }: { payments: PatientDetail["payments"] }) {
  if (payments.length === 0) {
    return <EmptyTab message="Sin pagos registrados" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="text-mu-text-muted">
              {formatDate(payment.date)}
            </TableCell>
            <TableCell>{formatCurrency(payment.amount)}</TableCell>
            <TableCell>{payment.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function NotesTab({ notes }: { notes: PatientDetail["notes"] }) {
  if (notes.length === 0) {
    return <EmptyTab message="Sin notas internas" />;
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li key={note.id} className="rounded-xl bg-amber-50/80 px-3 py-2.5">
          <p className="text-sm text-mu-text">{note.content}</p>
          <p className="mt-1 text-xs text-mu-text-muted">
            {note.author} · {formatDateTime(note.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function AuditTab({ audit }: { audit: PatientDetail["audit"] }) {
  if (audit.length === 0) {
    return <EmptyTab message="Sin registros de auditoría" />;
  }

  return (
    <ul className="space-y-3">
      {audit.map((entry) => (
        <li
          key={entry.id}
          className="rounded-xl border border-mu-border px-3 py-2.5"
        >
          <p className="text-sm font-medium text-mu-text">{entry.action}</p>
          <p className="mt-0.5 text-xs text-mu-text-muted">
            {entry.performedBy} · {formatDateTime(entry.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-mu-text">{value}</dd>
    </div>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-mu-border px-4 py-8 text-center text-sm text-mu-text-muted">
      {message}
    </p>
  );
}
