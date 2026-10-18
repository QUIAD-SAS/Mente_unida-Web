"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { formatDate } from "@/lib/format";
import {
  DOCUMENT_SECTIONS,
  SOLICITUD_STATUS_LABELS,
  solicitudStatusVariant,
} from "@/lib/admin/solicitudes/labels";
import type { SolicitudDetail, SolicitudDocument } from "@/lib/admin/solicitudes/types";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  ExternalLink,
  FileText,
  HelpCircle,
  Shield,
  X,
  XCircle,
} from "lucide-react";

interface SolicitudesDetailPanelProps {
  open: boolean;
  detail?: SolicitudDetail;
  isLoading?: boolean;
  isError?: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
  onRequireSupervisor: () => void;
}

export function SolicitudesDetailPanel({
  open,
  detail,
  isLoading,
  isError,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
  onRequireSupervisor,
}: SolicitudesDetailPanelProps) {
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
        aria-label="Detalle de solicitud"
        aria-hidden={!open}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-mu-border px-5">
          <h2 className="font-heading text-base font-semibold text-mu-text">
            Revisión de solicitud
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
            No se pudo cargar el detalle de la solicitud.
          </div>
        ) : (
          <>
            <div className="shrink-0 border-b border-mu-border px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-mu-text">
                    {detail.request.name}
                  </p>
                  <p className="text-sm text-mu-text-muted">
                    {detail.request.specialty}
                  </p>
                </div>
                <Badge variant={solicitudStatusVariant(detail.request.status)}>
                  {SOLICITUD_STATUS_LABELS[detail.request.status]}
                </Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-mu-text-muted">Fecha</dt>
                  <dd className="font-medium">
                    {formatDate(detail.request.submittedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-mu-text-muted">Experiencia</dt>
                  <dd className="font-medium">
                    {detail.request.experienceLabel ??
                      `${detail.request.experienceYears} años`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-mu-text-muted">Correo</dt>
                  <dd className="truncate">{detail.request.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mu-text-muted">Teléfono</dt>
                  <dd className="truncate">{detail.request.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mu-text-muted">País</dt>
                  <dd className="truncate">{detail.request.country || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mu-text-muted">Departamento</dt>
                  <dd className="truncate">
                    {detail.request.department || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-mu-text-muted">Ciudad</dt>
                  <dd className="truncate">{detail.request.city || "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-mu-text-muted">Dirección</dt>
                  <dd className="truncate">
                    {detail.request.addressLine || "—"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-mu-text-muted">Biografía</dt>
                  <dd className="whitespace-pre-wrap text-mu-text">
                    {detail.request.bio?.trim() || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="text-sm font-semibold text-mu-text">
                Experiencia laboral
              </h3>
              {(detail.request.workExperiences?.length ?? 0) === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed border-mu-border px-3 py-4 text-sm text-mu-text-muted">
                  Sin experiencias registradas
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {detail.request.workExperiences?.map((exp) => (
                    <li
                      key={exp.id}
                      className="rounded-xl border border-mu-border px-3 py-3 text-sm"
                    >
                      <p className="font-medium text-mu-text">
                        {exp.companyName}
                      </p>
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
              <p className="mt-3 text-sm font-medium text-mu-text">
                Total:{" "}
                {detail.request.experienceLabel ??
                  `${detail.request.experienceYears} años`}
              </p>

              <h3 className="mt-6 text-sm font-semibold text-mu-text">
                Documentos
              </h3>
              <div className="mt-4 space-y-5">
                {DOCUMENT_SECTIONS.map((section) => {
                  const docs = detail.documents.filter(
                    (d) => d.type === section.type,
                  );

                  return (
                    <section key={section.type}>
                      <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                        {section.label}
                      </p>
                      {docs.length === 0 ? (
                        <p className="mt-2 rounded-xl border border-dashed border-mu-border px-3 py-4 text-sm text-mu-text-muted">
                          Sin {section.label.toLowerCase()} cargado
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {docs.map((doc) => (
                            <li key={doc.id}>
                              <DocumentLink doc={doc} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-mu-border p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                Acciones
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={onApprove}
                >
                  <CheckCircle className="h-4 w-4" />
                  Aprobar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-mu-error hover:text-mu-error"
                  onClick={onReject}
                >
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRequestInfo}
                >
                  <HelpCircle className="h-4 w-4" />
                  Solicitar info
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRequireSupervisor}
                >
                  <Shield className="h-4 w-4" />
                  Supervisor
                </Button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function DocumentLink({ doc }: { doc: SolicitudDocument }) {
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
