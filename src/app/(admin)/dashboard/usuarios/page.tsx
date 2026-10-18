import { UsuariosView } from "@/components/usuarios/usuarios-view";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Usuarios" };

export default function UsuariosPage() {
  return (
    <Suspense fallback={null}>
      <UsuariosView />
    </Suspense>
  );
}
