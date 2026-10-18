import { IaAdministrativaView } from "@/components/ia-administrativa/ia-administrativa-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "IA Administrativa" };

export default function IaAdministrativaPage() {
  return <IaAdministrativaView />;
}
