import { AuthGate } from "@/components/dashboard/auth-gate";
import { PsychologistDashboardView } from "@/components/dashboard/psychologist-dashboard-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tu espacio profesional",
  robots: { index: false },
};

export default function PsychologistDashboardPage() {
  return (
    <AuthGate
      allowedRoles={["PSYCHOLOGIST", "CLINICAL_SUPERVISOR", "SUPERVISOR", "ADMIN"]}
    >
      <PsychologistDashboardView />
    </AuthGate>
  );
}
