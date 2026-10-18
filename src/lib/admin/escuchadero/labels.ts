import type {
  EscuchaderoPriority,
  EscuchaderoStatus,
} from "./types";

export const ESCUCHADERO_STATUS_LABELS: Record<EscuchaderoStatus, string> = {
  pending: "Pendiente",
  in_review: "En revisión",
  escalated: "Escalado",
  responded: "Respondido",
  closed: "Cerrado",
};

export const ESCUCHADERO_PRIORITY_LABELS: Record<EscuchaderoPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
};

export function statusBadgeVariant(
  status: EscuchaderoStatus,
): "default" | "success" | "warning" | "danger" | "muted" {
  switch (status) {
    case "responded":
      return "success";
    case "in_review":
      return "default";
    case "escalated":
      return "warning";
    case "closed":
      return "muted";
    default:
      return "warning";
  }
}

export function priorityBadgeVariant(
  priority: EscuchaderoPriority,
): "default" | "success" | "warning" | "danger" | "muted" {
  switch (priority) {
    case "critical":
      return "danger";
    case "high":
      return "warning";
    case "medium":
      return "default";
    default:
      return "muted";
  }
}
