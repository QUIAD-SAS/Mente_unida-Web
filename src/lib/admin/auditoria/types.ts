export type AuditModule =
  | "pacientes"
  | "psicologos"
  | "comunidad"
  | "moderacion"
  | "finanzas"
  | "escuchadero"
  | "soporte"
  | "solicitudes"
  | "ia_administrativa"
  | "configuracion"
  | "auth";

export interface AuditLogListItem {
  id: string;
  userName: string;
  action: string;
  module: AuditModule;
  createdAt: string;
  ipAddress: string;
  beforeSummary: string | null;
  afterSummary: string | null;
}

export interface AuditLogDetail extends AuditLogListItem {
  userId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

export interface AuditResponse {
  logs: AuditLogListItem[];
}

export interface AuditFilters {
  user?: string;
  module?: AuditModule | "all";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
