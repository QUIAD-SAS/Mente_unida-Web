"use client";

import { useAuthStore } from "@/lib/auth/store";

/**
 * Cierra la sesión unificada (paciente / psicólogo / admin) y vuelve al login.
 */
export async function logout(): Promise<void> {
  useAuthStore.getState().clearSession();
  window.location.href = "/login";
}
