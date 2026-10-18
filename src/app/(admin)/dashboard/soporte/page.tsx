import { SoporteView } from "@/components/soporte/soporte-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Soporte" };

export default function SoportePage() {
  return <SoporteView />;
}
