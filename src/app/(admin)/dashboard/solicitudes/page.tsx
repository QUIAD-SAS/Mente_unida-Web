import { SolicitudesView } from "@/components/solicitudes/solicitudes-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Solicitudes Profesionales" };

export default function SolicitudesPage() {
  return <SolicitudesView />;
}
