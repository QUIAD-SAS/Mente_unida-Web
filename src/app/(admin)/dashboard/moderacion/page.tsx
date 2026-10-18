import { ModeracionView } from "@/components/moderacion/moderacion-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Moderación" };

export default function ModeracionPage() {
  return <ModeracionView />;
}
