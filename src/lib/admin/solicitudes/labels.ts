import type { SolicitudStatus } from "./types";

export const SOLICITUD_STATUS_LABELS: Record<SolicitudStatus, string> = {
  pending: "Pendiente",
  in_review: "En revisión",
  approved: "Aprobada",
  rejected: "Rechazada",
  info_requested: "Info solicitada",
  supervisor_required: "Supervisor requerido",
};

export function solicitudStatusVariant(
  status: SolicitudStatus,
): "default" | "success" | "warning" | "danger" | "muted" {
  switch (status) {
    case "approved":
      return "success";
    case "in_review":
      return "default";
    case "rejected":
      return "danger";
    case "info_requested":
    case "supervisor_required":
      return "warning";
    default:
      return "muted";
  }
}

export const DOCUMENT_TYPE_LABELS = {
  rethus: "RETHUS",
  license: "Tarjeta profesional",
  specialization: "Especialización",
  identity: "Documento de identidad",
  certificate: "Certificado",
  other: "Otro",
} as const;

export const DOCUMENT_SECTIONS = [
  { type: "rethus" as const, label: "RETHUS" },
  { type: "license" as const, label: "Tarjeta profesional" },
  { type: "specialization" as const, label: "Especializaciones" },
];
