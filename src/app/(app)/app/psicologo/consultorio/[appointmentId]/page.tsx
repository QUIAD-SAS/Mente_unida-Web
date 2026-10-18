import { AuthGate } from "@/components/dashboard/auth-gate";
import { ConsultorioView } from "@/components/dashboard/consultorio-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Consultorio", robots: { index: false } };

export default async function ConsultorioAppointmentPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  return <AuthGate allowedRoles={["PSYCHOLOGIST"]}><ConsultorioView appointmentId={appointmentId} /></AuthGate>;
}
