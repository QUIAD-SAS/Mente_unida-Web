import type { UserRole } from "@/lib/api/types";

export type Permission =
  | "view_dashboard"
  | "edit_profile"
  | "book_appointments"
  | "manage_appointments"
  | "view_directory"
  | "manage_patients"
  | "manage_agenda"
  | "community_post"
  | "community_moderate"
  | "admin_access";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  PATIENT: [
    "view_dashboard",
    "edit_profile",
    "book_appointments",
    "view_directory",
  ],
  PSYCHOLOGIST: [
    "view_dashboard",
    "edit_profile",
    "manage_appointments",
    "manage_patients",
    "manage_agenda",
    "community_post",
    "view_directory",
  ],
  SUPERVISOR: [
    "view_dashboard",
    "edit_profile",
    "manage_appointments",
    "manage_patients",
    "manage_agenda",
    "community_post",
    "community_moderate",
    "view_directory",
  ],
  CLINICAL_SUPERVISOR: [
    "view_dashboard",
    "edit_profile",
    "manage_appointments",
    "manage_patients",
    "manage_agenda",
    "community_post",
    "community_moderate",
    "view_directory",
  ],
  ADMIN: [
    "view_dashboard",
    "edit_profile",
    "manage_appointments",
    "manage_patients",
    "manage_agenda",
    "community_post",
    "community_moderate",
    "admin_access",
    "view_directory",
    "book_appointments",
  ],
};

export function permissionsFromRoles(roles: UserRole[]): Permission[] {
  const set = new Set<Permission>();
  for (const role of roles) {
    for (const p of ROLE_PERMISSIONS[role] ?? []) {
      set.add(p);
    }
  }
  return [...set];
}

export function hasPermission(
  permissions: Permission[],
  required: Permission,
): boolean {
  return permissions.includes(required);
}

export function hasAnyRole(roles: string[], allowed: string[]): boolean {
  return allowed.some((r) => roles.includes(r));
}
