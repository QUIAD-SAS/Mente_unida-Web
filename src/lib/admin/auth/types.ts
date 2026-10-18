/** Roles administrativos del dashboard. Por ahora solo Super Admin. */
export type AdminRole =
  | "super_admin"
  | "moderador"
  | "escuchadero"
  | "supervisor_clinico"
  | "soporte"
  | "verificador_profesional";

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
}

/** Respuesta esperada del backend tras autenticación JWT. */
export interface AuthLoginResponse {
  access_token: string;
  refresh_token: string;
  user: AdminUser;
  role: AdminRole;
}

export type AuthErrorCode =
  | "invalid_credentials"
  | "session_expired"
  | "blocked"
  | "unknown";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}
