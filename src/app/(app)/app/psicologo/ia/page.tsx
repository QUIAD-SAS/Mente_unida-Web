import { AuthGate } from "@/components/dashboard/auth-gate";
import { UnavailablePageView } from "@/components/dashboard/unavailable-page-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IA Clínica",
  robots: { index: false },
};

export default function PsychologistIaPage() {
  return (
    <AuthGate
      allowedRoles={["PSYCHOLOGIST", "CLINICAL_SUPERVISOR", "SUPERVISOR", "ADMIN"]}
    >
      <UnavailablePageView role="psychologist" section="IA Clínica" />
    </AuthGate>
  );
}
