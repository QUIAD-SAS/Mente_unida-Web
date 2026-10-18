import { AuthGate } from "@/components/dashboard/auth-gate";
import { PsychologistPatientsView } from "@/components/dashboard/psychologist-patients-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pacientes",
  robots: { index: false },
};

export default function PsychologistPatientsPage() {
  return (
    <AuthGate
      allowedRoles={["PSYCHOLOGIST", "CLINICAL_SUPERVISOR", "SUPERVISOR", "ADMIN"]}
    >
      <PsychologistPatientsView />
    </AuthGate>
  );
}
