"use client";

import type { AuthUser } from "@/lib/api/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  _hasHydrated: boolean;
  setSession: (token: string, user: AuthUser, refreshToken?: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      _hasHydrated: false,
      setSession: (token, user, refreshToken) =>
        set({
          token,
          user,
          ...(refreshToken ? { refreshToken } : {}),
        }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      updateUser: (patch) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...patch } : s.user,
        })),
      clearSession: () =>
        set({ token: null, refreshToken: null, user: null }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: "mente-unida-auth",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function getDashboardPath(roles: string[]): string {
  if (roles.includes("ADMIN")) {
    return "/dashboard";
  }
  if (
    roles.includes("PSYCHOLOGIST") ||
    roles.includes("CLINICAL_SUPERVISOR") ||
    roles.includes("SUPERVISOR")
  ) {
    return "/app/psicologo";
  }
  return "/app/paciente";
}
