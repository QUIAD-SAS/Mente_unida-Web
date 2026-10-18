import type { SoporteStatus } from "./types";

export const SOPORTE_STATUS_LABELS: Record<SoporteStatus, string> = {
  open: "Abierto",
  pending: "Pendiente",
  resolved: "Resuelto",
  escalated: "Escalado",
  closed: "Cerrado",
};

export function soporteStatusVariant(
  status: SoporteStatus,
): "default" | "success" | "warning" | "danger" | "muted" {
  switch (status) {
    case "open":
      return "default";
    case "pending":
      return "warning";
    case "resolved":
      return "success";
    case "escalated":
      return "danger";
    default:
      return "muted";
  }
}
