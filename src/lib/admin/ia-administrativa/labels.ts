import type { IaAlertStatus, IaAlertType } from "./types";
import {
  AlertTriangle,
  Bot,
  CreditCard,
  FileWarning,
  MessageSquareWarning,
  UserX,
  type LucideIcon,
} from "lucide-react";

export const IA_ALERT_TYPE_LABELS: Record<IaAlertType, string> = {
  sensitive_post: "Publicación sensible",
  critical_message: "Mensaje crítico",
  poor_anonymization: "Caso mal anonimizado",
  pending_payment: "Pago pendiente",
  unvalidated_psychologist: "Psicólogo sin validar",
};

export const IA_ALERT_STATUS_LABELS: Record<IaAlertStatus, string> = {
  pending: "Pendiente",
  reviewed: "Revisado",
  ignored: "Ignorado",
  approved: "Aprobado",
  escalated: "Escalado",
};

export const IA_STAT_CARDS: Array<{
  key: keyof import("./types").IaStats;
  label: string;
  icon: LucideIcon;
  type: IaAlertType;
}> = [
  {
    key: "sensitivePosts",
    label: "Publicaciones sensibles",
    icon: FileWarning,
    type: "sensitive_post",
  },
  {
    key: "criticalMessages",
    label: "Mensajes críticos",
    icon: MessageSquareWarning,
    type: "critical_message",
  },
  {
    key: "poorAnonymization",
    label: "Casos mal anonimizados",
    icon: AlertTriangle,
    type: "poor_anonymization",
  },
  {
    key: "pendingPayments",
    label: "Pagos pendientes",
    icon: CreditCard,
    type: "pending_payment",
  },
  {
    key: "unvalidatedPsychologists",
    label: "Psicólogos sin validar",
    icon: UserX,
    type: "unvalidated_psychologist",
  },
];

export const IA_EXAMPLES = [
  "Posible ideación suicida.",
  "Caso mal anonimizado.",
  "Publicidad.",
];

export function iaStatusVariant(
  status: IaAlertStatus,
): "default" | "success" | "warning" | "danger" | "muted" {
  switch (status) {
    case "approved":
      return "success";
    case "escalated":
      return "danger";
    case "reviewed":
      return "default";
    case "ignored":
      return "muted";
    default:
      return "warning";
  }
}

export function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "text-mu-error";
  if (confidence >= 0.6) return "text-amber-600";
  return "text-mu-text-muted";
}

export const IA_DISCLAIMER =
  "La IA solo sugiere. Las decisiones finales las toma el equipo administrativo.";

export const BotIcon = Bot;
