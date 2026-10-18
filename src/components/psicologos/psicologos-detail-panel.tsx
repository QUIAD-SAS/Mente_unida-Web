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
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  PSYCHOLOGIST_DETAIL_TABS,
  PSYCHOLOGIST_PLAN_LABELS,
  PSYCHOLOGIST_STATUS_LABELS,
  psychologistStatusVariant,
} from "@/lib/admin/psicologos/labels";
import type {
  PsychologistDetail,
  PsychologistDetailTab,
  PsychologistDocument,
} from "@/lib/admin/psicologos/types";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText, Pencil, X } from "lucide-react";

interface PsicologosDetailPanelProps {
  open: boolean;
  detail?: PsychologistDetail;
  isLoading?: boolean;
  isError?: boolean;
  activeTab: PsychologistDetailTab;
  onTabChange: (tab: PsychologistDetailTab) => void;
  onClose: () => void;
  onEdit: () => void;
}

export function PsicologosDetailPanel({
  open,
  detail,
  isLoading,
  isError,
  activeTab,
  onTabChange,
  onClose,
  onEdit,
}: PsicologosDetailPanelProps) {
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
        aria-label="Perfil del psicólogo"
        aria-hidden={!open}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-mu-border px-5">
          <h2 className="font-heading text-base font-semibold text-mu-text">
            Perfil del psicólogo
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
          </div>
        ) : isError || !detail ? (
          <div className="flex flex-1 items-center justify-center p-5 text-sm text-mu-text-muted">
            No se pudo cargar el perfil del psicólogo.
          </div>
        ) : (
          <>
            <div className="shrink-0 border-b border-mu-border px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-mu-text">
                    {detail.psychologist.name}
                  </p>
                  <p className="text-sm text-mu-text-muted">
                    {detail.psychologist.specialty}
                  </p>
                </div>
                <Badge
                  variant={psychologistStatusVariant(detail.psychologist.status)}
                >
                  {PSYCHOLOGIST_STATUS_LABELS[detail.psychologist.status]}
                </Badge>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-mu-text-muted">
                <div>
                  <dt>Correo</dt>
                  <dd className="truncate text-mu-text">
                    {detail.psychologist.email}
                  </dd>
                </div>
                <div>
                  <dt>Teléfono</dt>
                  <dd className="truncate text-mu-text">
                    {detail.psychologist.phone || "—"}
                  </dd>
                </div>
                <div>
                  <dt>Plan</dt>
                  <dd className="text-mu-text">
                    {PSYCHOLOGIST_PLAN_LABELS[detail.psychologist.plan]}
                  </dd>
                </div>
                <div>
                  <dt>Ciudad</dt>
                  <dd className="text-mu-text">
                    {detail.psychologist.city || "—"}
                  </dd>
                </div>
                <div>
                  <dt>Departamento</dt>
                  <dd className="text-mu-text">
                    {detail.psychologist.department || "—"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt>Dirección</dt>
                  <dd className="text-mu-text">
                    {detail.psychologist.addressLine || "—"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt>Biografía</dt>
                  <dd className="whitespace-pre-wrap text-mu-text">
                    {detail.psychologist.bio?.trim() || "—"}
                  </dd>
                </div>
              </dl>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            </div>

            <div className="shrink-0 overflow-x-auto border-b border-mu-border px-2">
              <div className="flex min-w-max gap-1 py-2">
                {PSYCHOLOGIST_DETAIL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
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
              {activeTab === "rethus" && (
                <DocumentsTab
                  documents={detail.documents.filter((d) => d.type === "rethus")}
                  emptyMessage="Sin RETHUS cargado"
                />
              )}
              {activeTab === "tarjeta" && (
                <DocumentsTab
                  documents={detail.documents.filter((d) => d.type === "license")}
                  emptyMessage="Sin tarjeta profesional cargada"
                />
              )}
              {activeTab === "especializaciones" && (
                <DocumentsTab
                  documents={detail.documents.filter(
                    (d) => d.type === "specialization",
                  )}
                  emptyMessage="Sin especializaciones cargadas"
                />
              )}
              {activeTab === "experience" && <ExperienceTab detail={detail} />}
              {activeTab === "specialties" && (
                <SpecialtiesTab specialties={detail.psychologist.specialties} />
              )}
              {activeTab === "sessions" && (
                <SessionsTab sessions={detail.sessions} />
              )}
              {activeTab === "income" && <IncomeTab income={detail.income} />}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function DocumentsTab({
  documents,
  emptyMessage,
}: {
  documents: PsychologistDocument[];
  emptyMessage: string;
}) {
  if (documents.length === 0) {
    return <EmptyTab message={emptyMessage} />;
  }

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li key={doc.id}>
          <DocumentLink doc={doc} />
        </li>
      ))}
    </ul>
  );
}

function DocumentLink({ doc }: { doc: PsychologistDocument }) {
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl border border-mu-border px-3 py-2.5 text-sm text-mu-primary hover:bg-mu-accent"
    >
      <FileText className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{doc.name}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
}

function ExperienceTab({ detail }: { detail: PsychologistDetail }) {
  const experiences = detail.psychologist.workExperiences ?? [];

  return (
    <div className="space-y-4">
      <InfoField
        label="Experiencia total"
        value={
          detail.psychologist.experienceLabel ??
          `${detail.psychologist.experienceYears} años`
        }
      />
      {experiences.length === 0 ? (
        <EmptyTab message="Sin experiencias laborales registradas" />
      ) : (
        <ul className="space-y-2">
          {experiences.map((exp) => (
            <li
              key={exp.id}
              className="rounded-xl border border-mu-border px-3 py-3 text-sm"
            >
              <p className="font-medium text-mu-text">{exp.companyName}</p>
              <p className="text-mu-text-muted">{exp.roleTitle}</p>
              <p className="mt-1 text-xs text-mu-text-muted">
                {exp.startDate}
                {exp.endDate ? ` → ${exp.endDate}` : " → Actualidad"}
                {" · "}
                {exp.durationLabel}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SpecialtiesTab({ specialties }: { specialties: string[] }) {
  if (specialties.length === 0) {
    return <EmptyTab message="Sin especialidad registrada" />;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {specialties.map((s) => (
        <li key={s}>
          <Badge variant="default">{s}</Badge>
        </li>
      ))}
    </ul>
  );
}

function SessionsTab({
  sessions,
}: {
  sessions: PsychologistDetail["sessions"];
}) {
  if (sessions.length === 0) {
    return <EmptyTab message="Sin sesiones registradas" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paciente</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((s) => (
          <TableRow key={s.id}>
            <TableCell>{s.patientAlias}</TableCell>
            <TableCell className="text-mu-text-muted">
              {formatDateTime(s.date)}
            </TableCell>
            <TableCell>{s.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function IncomeTab({ income }: { income: PsychologistDetail["income"] }) {
  if (income.length === 0) {
    return <EmptyTab message="Sin ingresos registrados" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Periodo</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {income.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.period}</TableCell>
            <TableCell>{formatCurrency(item.amount)}</TableCell>
            <TableCell>{item.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm text-mu-text">{value}</p>
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
