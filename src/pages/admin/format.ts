import type { VerificationStatus } from "../../api/admin";

export const verificationLabel: Record<VerificationStatus, string> = {
  PENDING: "Pendiente",
  IN_REVIEW: "En revisión",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  SUSPENDED: "Suspendido",
};

export const documentTypeLabel: Record<string, string> = {
  IDENTITY: "Identidad",
  LICENSE: "Tarjeta profesional",
  CERTIFICATION: "Certificación",
  RETHUS: "RETHUS",
  SPECIALIZATION: "Especialización",
  OTHER: "Otro",
};

export const decisionLabel: Record<string, string> = {
  VERIFICATION_APPROVED: "Aprobación",
  VERIFICATION_REJECTED: "Rechazo",
  VERIFICATION_CHANGES_REQUESTED: "Corrección pedida",
};

export function initials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? "");
  return letters.join("").toUpperCase() || "—";
}

export function when(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `Hace ${days} d`;
  return date.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export function money(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
  } catch {
    return `${cents / 100} ${currency}`;
  }
}

export function notesIssue(notes: string) {
  const value = notes.trim();
  if (value.length < 10) return "La nota debe tener al menos 10 caracteres.";
  if (value.length > 2000) return "La nota admite hasta 2000 caracteres.";
  return "";
}
