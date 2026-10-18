/** Nombres de cookies HttpOnly para la sesión administrativa. */
export const AUTH_COOKIES = {
  accessToken: "mu_admin_access_token",
  refreshToken: "mu_admin_refresh_token",
  rememberMe: "mu_admin_remember",
} as const;

export const COOKIE_MAX_AGE = {
  session: 60 * 60 * 8,
  remember: 60 * 60 * 24 * 30,
} as const;
