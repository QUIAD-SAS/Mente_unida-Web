import { useEffect, useRef, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiErrorMessage } from "../api/client";
import type { AccessContext } from "../api/types";
import { useAuth } from "./AuthProvider";

export function RequireSession({ role, children }: { role: AccessContext; children: ReactNode }) {
  const { status, user, accessContext, selectContext } = useAuth();
  const location = useLocation();
  const started = useRef<AccessContext | null>(null);
  const [contextError, setContextError] = useState("");

  useEffect(() => {
    if (status !== "authenticated" || !user?.roles.includes(role) || accessContext === role) return;
    if (started.current === role) return;
    started.current = role;
    selectContext(role).catch((error: unknown) => {
      setContextError(apiErrorMessage(error, "No pudimos activar este perfil."));
    });
  }, [accessContext, role, selectContext, status, user]);

  if (contextError) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface px-6">
        <p className="max-w-md text-center text-sm text-error" role="alert">
          {contextError}
        </p>
      </main>
    );
  }

  if (status === "loading" || (user?.roles.includes(role) && accessContext !== role)) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface px-6">
        <p className="font-display text-sm font-semibold text-ink-soft">Conectando tu sesión…</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/iniciar-sesion" replace state={{ from: location.pathname }} />;
  }

  if (!user.roles.includes(role)) {
    const home = user.roles.includes("PSYCHOLOGIST") ? "/psicologo" : user.roles.includes("PATIENT") ? "/paciente" : user.roles.includes("ADMIN") ? "/admin" : "/";
    return <Navigate to={home} replace />;
  }

  return children;
}
