export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CO").format(value);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCOP(cents: number, currency = "COP"): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatAppointmentDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function appointmentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Pendiente",
    SCHEDULED: "Agendada",
    CONFIRMED: "Confirmada",
    IN_PROGRESS: "En curso",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    NO_SHOW: "No asistió",
  };
  return map[status] ?? status;
}

export function postTypeLabel(type: string): string {
  const map: Record<string, string> = {
    CASE: "Caso clínico",
    ARTICLE: "Artículo",
    DEBATE: "Pregunta / debate",
    EVENT: "Evento",
    RESOURCE: "Recurso",
    // Compatibilidad con valores legados
    CLINICAL_CASE: "Caso clínico",
    SCIENTIFIC_ARTICLE: "Artículo",
    DOWNLOADABLE_RESOURCE: "Recurso",
  };
  return map[type] ?? type;
}

export function formatCommunityDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
