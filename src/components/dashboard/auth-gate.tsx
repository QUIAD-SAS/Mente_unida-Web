"use client";

import { getDashboardPath } from "@/lib/auth/store";
import { useSession } from "@/lib/auth/session-context";
import { useAuthStore } from "@/lib/auth/store";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface AuthGateProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function AuthGate({ children, allowedRoles }: AuthGateProps) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const token = useAuthStore((s) => s.token);
  const { session, loading } = useSession();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!loading && session && allowedRoles?.length) {
      const roles = session.roles;
      if (!allowedRoles.some((r) => roles.includes(r as (typeof roles)[number]))) {
        router.replace(getDashboardPath(roles));
      }
    }
  }, [hasHydrated, token, loading, session, allowedRoles, router]);

  if (!hasHydrated || !token || loading || !session) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-mu-text-muted">
        Cargando tu espacio…
      </div>
    );
  }

  if (
    allowedRoles?.length &&
    !allowedRoles.some((r) => session.roles.includes(r as (typeof session.roles)[number]))
  ) {
    return null;
  }

  return <>{children}</>;
}
