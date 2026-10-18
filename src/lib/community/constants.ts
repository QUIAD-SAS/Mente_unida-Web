import type { CommunityPostType } from "@/lib/api/types";

export type CommunityFeedFilter =
  | "all"
  | CommunityPostType
  | "mentorship"
  | "supervision";

export interface CreatePostOption {
  type: CommunityPostType;
  label: string;
  anonymized?: boolean;
}

export const CREATE_POST_OPTIONS: CreatePostOption[] = [
  { type: "DEBATE", label: "Publicar experiencia" },
  { type: "CASE", label: "Caso anonimizado", anonymized: true },
  { type: "ARTICLE", label: "Artículo" },
  { type: "EVENT", label: "Evento" },
  { type: "RESOURCE", label: "Recurso" },
  { type: "DEBATE", label: "Pregunta clínica" },
];

export const FEED_FILTERS: { id: CommunityFeedFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "CASE", label: "Casos" },
  { id: "ARTICLE", label: "Artículos" },
  { id: "EVENT", label: "Eventos" },
  { id: "DEBATE", label: "Preguntas" },
  { id: "mentorship", label: "Mentorías" },
  { id: "supervision", label: "Supervisiones" },
];

export const TRENDING_TOPICS = [
  "Ansiedad",
  "TCC",
  "Trauma",
  "Duelo",
  "Burnout",
  "Neuropsicología",
] as const;

export const LEFT_NAV_ITEMS: Array<
  | { id: string; label: string; href: string }
  | { id: string; label: string; upcoming: true }
> = [
  { id: "profile", label: "Mi Perfil", href: "/app/psicologo/configuracion" },
  { id: "saved", label: "Guardados", upcoming: true },
  { id: "mine", label: "Mis publicaciones", upcoming: true },
  { id: "mentorship", label: "Mentorías", upcoming: true },
  { id: "supervision", label: "Supervisiones", upcoming: true },
  { id: "events", label: "Eventos", upcoming: true },
];
