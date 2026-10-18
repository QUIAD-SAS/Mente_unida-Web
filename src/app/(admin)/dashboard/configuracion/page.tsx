import { ConfiguracionView } from "@/components/configuracion/configuracion-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Configuración" };

export default function ConfiguracionPage() {
  return <ConfiguracionView />;
}
