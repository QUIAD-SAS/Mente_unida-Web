import { AuthGate } from "@/components/dashboard/auth-gate";
import { PsychologistAgendaView } from "@/components/dashboard/psychologist-agenda-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda",
  robots: { index: false },
};

export default function PsychologistAgendaPage() {
  return (
    <AuthGate
      allowedRoles={["PSYCHOLOGIST", "CLINICAL_SUPERVISOR", "SUPERVISOR", "ADMIN"]}
    >
      <PsychologistAgendaView />
    </AuthGate>
  );
}
