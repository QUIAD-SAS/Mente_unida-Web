import { AuthGate } from "@/components/dashboard/auth-gate";
import { ProfileSettingsView } from "@/components/dashboard/profile-settings-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración",
  robots: { index: false },
};

export default function PatientSettingsPage() {
  return (
    <AuthGate allowedRoles={["PATIENT", "ADMIN"]}>
      <ProfileSettingsView role="patient" />
    </AuthGate>
  );
}
