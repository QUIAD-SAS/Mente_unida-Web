import type { CommunityPostStatus, CommunityPostType } from "./types";

export const COMMUNITY_TYPE_LABELS: Record<CommunityPostType, string> = {
  article: "Artículo",
  case: "Caso",
  event: "Evento",
  question: "Pregunta",
  resource: "Recurso",
};

export const COMMUNITY_STATUS_LABELS: Record<CommunityPostStatus, string> = {
  published: "Publicado",
  hidden: "Oculto",
  reported: "Reportado",
  removed: "Eliminado",
};

export function communityStatusVariant(
  status: CommunityPostStatus,
): "default" | "success" | "warning" | "danger" | "muted" {
  switch (status) {
    case "published":
      return "success";
    case "reported":
      return "warning";
    case "hidden":
      return "muted";
    case "removed":
      return "danger";
    default:
      return "default";
  }
}

export const COMMUNITY_TYPE_FILTERS: Array<CommunityPostType | "all"> = [
  "all",
  "article",
  "case",
  "event",
  "question",
  "resource",
];
