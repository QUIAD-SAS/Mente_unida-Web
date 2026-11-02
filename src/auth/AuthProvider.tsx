import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchMe, login as loginRequest, logout as logoutRequest, registerPatient as registerPatientRequest, registerPsychologist as registerPsychologistRequest, type RegisterPatientInput, type RegisterPsychologistInput } from "../api/auth";
import { ApiError, setSessionExpiredHandler } from "../api/client";
import { clearSession, readSession, writeAccessContext, writeSession } from "../api/session";
import type { AccessContext, AuthSession, SessionUser } from "../api/types";

type AuthStatus = "loading" | "anonymous" | "authenticated";

type AuthValue = {
  status: AuthStatus;
  user: SessionUser | null;
  accessContext: AccessContext | null;
  login: (input: { email: string; password: string; context: AccessContext; remember: boolean }) => Promise<SessionUser>;
  registerPatient: (input: RegisterPatientInput) => Promise<SessionUser>;
  registerPsychologist: (input: RegisterPsychologistInput) => Promise<SessionUser>;
  selectContext: (context: AccessContext) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = readSession();
  const [status, setStatus] = useState<AuthStatus>(stored.accessToken ? "loading" : "anonymous");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [accessContext, setAccessContext] = useState<AccessContext | null>(stored.accessContext);

  const applyUser = useCallback((next: SessionUser) => {
    setUser(next);
    setAccessContext(next.accessContext);
    setStatus("authenticated");
  }, []);

  const dropSession = useCallback(() => {
    clearSession();
    setUser(null);
    setAccessContext(null);
    setStatus("anonymous");
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(dropSession);
    return () => setSessionExpiredHandler(null);
  }, [dropSession]);

  useEffect(() => {
    if (!readSession().accessToken) return;
    let cancelled = false;
    fetchMe()
      .then((next) => {
        if (!cancelled) applyUser(next);
      })
      .catch(() => {
        if (!cancelled) dropSession();
      });
    return () => {
      cancelled = true;
    };
  }, [applyUser, dropSession]);

  const openSession = useCallback(
    async (session: AuthSession, context: AccessContext, remember: boolean) => {
      if (!session.user.roles.includes(context)) {
        writeSession({ accessToken: session.accessToken, accessContext: session.user.accessContext, remember: false });
        try {
          await logoutRequest();
        } catch {
          // La cookie queda limpia en el siguiente intento si el servidor ya cerró la sesión.
        }
        clearSession();
        throw new ApiError(403, "FORBIDDEN", "Esta cuenta no tiene el perfil seleccionado.");
      }

      writeSession({ accessToken: session.accessToken, accessContext: context, remember });
      const next = session.user.accessContext === context ? session.user : await fetchMe();
      applyUser(next);
      return next;
    },
    [applyUser],
  );

  const value = useMemo<AuthValue>(
    () => ({
      status,
      user,
      accessContext,
      login: async (input) => openSession(await loginRequest({ email: input.email, password: input.password }), input.context, input.remember),
      registerPatient: async (input) => openSession(await registerPatientRequest(input), "PATIENT", true),
      registerPsychologist: async (input) => openSession(await registerPsychologistRequest(input), "PSYCHOLOGIST", true),
      selectContext: async (context) => {
        writeAccessContext(context);
        setAccessContext(context);
        applyUser(await fetchMe());
      },
      logout: async () => {
        try {
          if (readSession().accessToken) await logoutRequest();
        } catch {
          // Cerramos la sesión local aunque el servidor ya no reconozca el token.
        }
        dropSession();
      },
    }),
    [accessContext, applyUser, dropSession, openSession, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return value;
}
