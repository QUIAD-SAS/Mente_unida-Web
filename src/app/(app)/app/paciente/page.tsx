import { AuthGate } from "@/components/dashboard/auth-gate";
import { PatientDashboardView } from "@/components/dashboard/patient-dashboard-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tu espacio personal",
  robots: { index: false },
};

export default function PatientDashboardPage() {
  return (
    <AuthGate allowedRoles={["PATIENT", "ADMIN"]}>
      <PatientDashboardView />
    </AuthGate>
  );
}
