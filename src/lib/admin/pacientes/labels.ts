import type { PatientStatus } from "./types";

export const PATIENT_STATUS_LABELS: Record<PatientStatus, string> = {
  active: "Activo",
  suspended: "Suspendido",
  pending: "Correo sin verificar",
};

export function patientStatusVariant(
  status: PatientStatus,
): "default" | "success" | "warning" | "danger" | "muted" {
  switch (status) {
    case "active":
      return "success";
    case "suspended":
      return "danger";
    default:
      return "warning";
  }
}

export const PATIENT_DETAIL_TABS = [
  { id: "info" as const, label: "Información básica" },
  { id: "appointments" as const, label: "Historial citas" },
  { id: "subscription" as const, label: "Suscripción" },
  { id: "payments" as const, label: "Pagos" },
  { id: "notes" as const, label: "Notas" },
  { id: "audit" as const, label: "Auditoría" },
];
