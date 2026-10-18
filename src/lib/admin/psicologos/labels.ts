import type { PsychologistPlan, PsychologistStatus } from "./types";

export const PSYCHOLOGIST_STATUS_LABELS: Record<PsychologistStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  supervisor: "Supervisor",
  rejected: "Rechazado",
};

export const PSYCHOLOGIST_PLAN_LABELS: Record<PsychologistPlan, string> = {
  basic: "Básico",
  professional: "Profesional",
  premium: "Premium",
  none: "Sin plan",
};

export function psychologistStatusVariant(
  status: PsychologistStatus,
): "default" | "success" | "warning" | "danger" | "muted" {
  switch (status) {
    case "approved":
      return "success";
    case "supervisor":
      return "default";
    case "rejected":
      return "danger";
    default:
      return "warning";
  }
}

export const PSYCHOLOGIST_DETAIL_TABS = [
  { id: "rethus" as const, label: "RETHUS" },
  { id: "tarjeta" as const, label: "Tarjeta" },
  { id: "especializaciones" as const, label: "Especializaciones" },
  { id: "experience" as const, label: "Experiencia" },
  { id: "specialties" as const, label: "Especialidad" },
  { id: "sessions" as const, label: "Sesiones" },
  { id: "income" as const, label: "Ingresos" },
];
