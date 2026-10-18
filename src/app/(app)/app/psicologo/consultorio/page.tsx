import { AuthGate } from "@/components/dashboard/auth-gate";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultorio",
  robots: { index: false },
};

export default function PsychologistConsultorioPage() {
  return (
    <AuthGate
      allowedRoles={["PSYCHOLOGIST", "CLINICAL_SUPERVISOR", "SUPERVISOR", "ADMIN"]}
    >
      <main className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="font-heading text-2xl font-bold">Consultorio virtual</h1>
        <p className="mt-2 text-sm text-mu-text-muted">
          Selecciona una cita confirmada desde tu agenda para abrir el consultorio.
        </p>
        <Button className="mt-5" href="/app/psicologo/agenda">Ir a agenda</Button>
      </main>
    </AuthGate>
  );
}
