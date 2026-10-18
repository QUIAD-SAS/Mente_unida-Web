import { AuthGate } from "@/components/dashboard/auth-gate";
import { PatientConsultorioView } from "@/components/dashboard/patient-consultorio-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultorio",
  robots: { index: false },
};

export default async function PatientConsultorioAppointmentPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  return (
    <AuthGate allowedRoles={["PATIENT"]}>
      <PatientConsultorioView appointmentId={appointmentId} />
    </AuthGate>
  );
}
