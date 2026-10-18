import { EscuchaderoView } from "@/components/escuchadero/escuchadero-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Escuchadero" };

export default function EscuchaderoPage() {
  return <EscuchaderoView />;
}
