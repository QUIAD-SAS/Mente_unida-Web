import { AuthGate } from "@/components/dashboard/auth-gate";
import { ProfileSettingsView } from "@/components/dashboard/profile-settings-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración",
  robots: { index: false },
};

export default function PsychologistSettingsPage() {
  return (
    <AuthGate
      allowedRoles={["PSYCHOLOGIST", "CLINICAL_SUPERVISOR", "SUPERVISOR", "ADMIN"]}
    >
      <ProfileSettingsView role="psychologist" />
    </AuthGate>
  );
}
