import { AuthGate } from "@/components/dashboard/auth-gate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BookSessionView } from "@/components/book-session/book-session-view";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Agendar cita",
  robots: { index: false },
};

function BookSessionContent({
  psychologistId,
}: {
  psychologistId: string | null;
}) {
  return (
    <DashboardShell role="patient">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-heading text-2xl font-bold text-mu-text">
          Agendar cita
        </h1>
        <p className="mt-1 text-sm text-mu-text-muted">
          Solicita acompañamiento profesional en pocos pasos.
        </p>
      </header>
      <BookSessionView initialPsychologistId={psychologistId} />
    </DashboardShell>
  );
}

export default async function BookSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ psychologistId?: string }>;
}) {
  const params = await searchParams;
  const psychologistId = params.psychologistId ?? null;

  return (
    <AuthGate allowedRoles={["PATIENT", "ADMIN"]}>
      <Suspense
        fallback={
          <p className="p-8 text-sm text-mu-text-muted">Cargando…</p>
        }
      >
        <BookSessionContent psychologistId={psychologistId} />
      </Suspense>
    </AuthGate>
  );
}
