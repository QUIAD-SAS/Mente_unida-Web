"use client";

import { getDashboardPath, useAuthStore } from "@/lib/auth/store";
import { useSession } from "@/lib/auth/session-context";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

/**
 * Protege el panel administrativo: requiere sesión + rol ADMIN.
 */
export function AdminAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const token = useAuthStore((s) => s.token);
  const { session, loading } = useSession();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!token) {
      router.replace("/login?next=/dashboard");
      return;
    }

    if (!loading && session) {
      const roles = session.roles ?? [];
      if (!roles.includes("ADMIN")) {
        router.replace(getDashboardPath(roles));
      }
    }
  }, [hasHydrated, token, loading, session, router]);

  if (!hasHydrated || !token || loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mu-background text-mu-text-muted">
        Cargando panel administrativo…
      </div>
    );
  }

  if (!session.roles.includes("ADMIN")) {
    return null;
  }

  return <>{children}</>;
}
