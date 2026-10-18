import { ComunidadView } from "@/components/comunidad/comunidad-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Comunidad" };

export default function ComunidadPage() {
  return <ComunidadView />;
}
