import { AuditoriaView } from "@/components/auditoria/auditoria-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Auditoría" };

export default function AuditoriaPage() {
  return <AuditoriaView />;
}
