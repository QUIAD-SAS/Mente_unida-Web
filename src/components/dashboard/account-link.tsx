"use client";

import { getUserDisplayLabel } from "@/lib/auth/display";
import { useSession } from "@/lib/auth/session-context";
import Link from "next/link";

export function AccountLink() {
  const { session } = useSession();
  const isPsych =
    session?.roles.includes("PSYCHOLOGIST") ||
    session?.roles.includes("CLINICAL_SUPERVISOR") ||
    session?.roles.includes("SUPERVISOR");
  const href = isPsych
    ? "/app/psicologo/configuracion"
    : "/app/paciente/configuracion";

  return (
    <Link
      href={href}
      className="text-sm text-mu-text-muted hover:text-mu-primary"
    >
      {getUserDisplayLabel(session)}
    </Link>
  );
}
