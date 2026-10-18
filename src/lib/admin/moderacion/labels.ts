import type { ModerationReason, ModerationStatus } from "./types";

export const MODERATION_REASON_LABELS: Record<ModerationReason, string> = {
  spam: "Spam",
  violence: "Violencia",
  advertising: "Publicidad",
  incorrect_anonymization: "Anonimización incorrecta",
  offensive_language: "Lenguaje ofensivo",
};

export const MODERATION_STATUS_LABELS: Record<ModerationStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  hidden: "Oculto",
  removed: "Eliminado",
};

export function moderationStatusVariant(
  status: ModerationStatus,
): "default" | "success" | "warning" | "danger" | "muted" {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "hidden":
      return "muted";
    case "removed":
      return "danger";
    default:
      return "default";
  }
}

export const MODERATION_REASON_FILTERS: Array<ModerationReason | "all"> = [
  "all",
  "spam",
  "violence",
  "advertising",
  "incorrect_anonymization",
  "offensive_language",
];
