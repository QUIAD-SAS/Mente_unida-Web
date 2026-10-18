import { AuthGate } from "@/components/dashboard/auth-gate";
import { PatientAppointmentsView } from "@/components/dashboard/patient-appointments-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis citas",
  robots: { index: false },
};

export default function PatientAppointmentsPage() {
  return (
    <AuthGate allowedRoles={["PATIENT", "ADMIN"]}>
      <PatientAppointmentsView />
    </AuthGate>
  );
}
