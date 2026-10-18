import { AuthGate } from "@/components/dashboard/auth-gate";
import { PsychologistCommunityView } from "@/components/dashboard/psychologist-community-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comunidad",
  robots: { index: false },
};

export default function PsychologistCommunityPage() {
  return (
    <AuthGate
      allowedRoles={["PSYCHOLOGIST", "CLINICAL_SUPERVISOR", "SUPERVISOR", "ADMIN"]}
    >
      <PsychologistCommunityView />
    </AuthGate>
  );
}
