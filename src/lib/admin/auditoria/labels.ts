import type { AuditModule } from "./types";

export const AUDIT_MODULE_LABELS: Record<AuditModule, string> = {
  pacientes: "Pacientes",
  psicologos: "Psicólogos",
  comunidad: "Comunidad",
  moderacion: "Moderación",
  finanzas: "Finanzas",
  escuchadero: "Escuchadero",
  soporte: "Soporte",
  solicitudes: "Solicitudes",
  ia_administrativa: "IA Administrativa",
  configuracion: "Configuración",
  auth: "Autenticación",
};

export const AUDIT_MODULE_FILTERS: Array<AuditModule | "all"> = [
  "all",
  "pacientes",
  "psicologos",
  "comunidad",
  "moderacion",
  "finanzas",
  "escuchadero",
  "soporte",
  "solicitudes",
  "ia_administrativa",
  "configuracion",
  "auth",
];

export const AUDIT_READONLY_NOTICE =
  "Registro de solo lectura. No se permite editar ni eliminar entradas de auditoría.";
