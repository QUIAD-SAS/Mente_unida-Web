import { FinanzasView } from "@/components/finanzas/finanzas-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Finanzas" };

export default function FinanzasPage() {
  return <FinanzasView />;
}
