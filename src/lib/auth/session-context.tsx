"use client";

import { api, ApiError } from "@/lib/api-client";
import type { SessionUser } from "@/lib/api/types";
import { useAuthStore } from "@/lib/auth/store";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface SessionContextValue {
  session: SessionUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasPermission: (permission: SessionUser["permissions"][number]) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const token = useAuthStore((s) => s.token);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!hasHydrated) return;

    const currentToken = useAuthStore.getState().token;
    if (!currentToken) {
      setSession(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const loadProfile = async (accessToken: string) => {
      const me = await api.auth.me(accessToken);
      setSession(me);
      useAuthStore.getState().updateUser({
        alias: me.alias ?? undefined,
        role: me.role,
        roles: me.roles,
      });
    };

    try {
      await loadProfile(currentToken);
    } catch (err) {
      const canRefresh =
        err instanceof ApiError &&
        err.status === 401 &&
        useAuthStore.getState().refreshToken;

      if (canRefresh) {
        try {
          const refreshed = await api.auth.refresh(
            useAuthStore.getState().refreshToken!,
          );
          useAuthStore
            .getState()
            .setTokens(refreshed.accessToken, refreshed.refreshToken ?? "");
          await loadProfile(refreshed.accessToken);
          return;
        } catch {
          // cae al clearSession
        }
      }

      clearSession();
      setSession(null);
      setError("Sesión expirada");
    } finally {
      setLoading(false);
    }
  }, [hasHydrated, clearSession]);

  useEffect(() => {
    if (hasHydrated) {
      void refresh();
    }
  }, [hasHydrated, token, refresh]);

  const hasPermission = useCallback(
    (permission: SessionUser["permissions"][number]) =>
      session?.permissions.includes(permission) ?? false,
    [session],
  );

  const value = useMemo(
    () => ({ session, loading, error, refresh, hasPermission }),
    [session, loading, error, refresh, hasPermission],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
  }
  return ctx;
}
