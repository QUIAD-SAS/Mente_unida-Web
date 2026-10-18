import type { AuthUser, SessionUser, UserRole } from "@/lib/api/types";

const PSYCH_ROLES: UserRole[] = [
  "PSYCHOLOGIST",
  "CLINICAL_SUPERVISOR",
  "SUPERVISOR",
  "ADMIN",
];

export function isPsychologistRole(roles?: UserRole[] | string[]): boolean {
  return (
    roles?.some((r) =>
      PSYCH_ROLES.includes(r as UserRole),
    ) ?? false
  );
}

/** Alias — solo para pacientes */
export function getDisplayAlias(
  session?: SessionUser | null,
  user?: AuthUser | null,
): string {
  return (
    session?.alias ??
    session?.profile.patient?.alias ??
    user?.alias ??
    "Usuario"
  );
}

/** Nombre real — para psicólogos y contexto profesional */
export function getDisplayName(
  session?: SessionUser | null,
  user?: AuthUser | null,
): string {
  return session?.profile.name ?? user?.alias ?? "Profesional";
}

/** Etiqueta de usuario según rol: alias (paciente) o nombre (psicólogo) */
export function getUserDisplayLabel(
  session?: SessionUser | null,
  user?: AuthUser | null,
): string {
  const roles = session?.roles ?? user?.roles ?? [user?.role ?? "PATIENT"];
  if (isPsychologistRole(roles)) {
    return getDisplayName(session, user);
  }
  return getDisplayAlias(session, user);
}

export function maskValue(value: string | null | undefined): string {
  if (!value) return "••••••••";
  if (value.length <= 2) return "••";
  return `${value.slice(0, 1)}${"•".repeat(Math.min(value.length - 1, 8))}`;
}
