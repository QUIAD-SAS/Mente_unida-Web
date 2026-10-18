import { AuthGate } from "@/components/dashboard/auth-gate";
import { UnavailablePageView } from "@/components/dashboard/unavailable-page-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supervisiones",
  robots: { index: false },
};

export default function PsychologistSupervisionesPage() {
  return (
    <AuthGate
      allowedRoles={["PSYCHOLOGIST", "CLINICAL_SUPERVISOR", "SUPERVISOR", "ADMIN"]}
    >
      <UnavailablePageView role="psychologist" section="Supervisiones" />
    </AuthGate>
  );
}
