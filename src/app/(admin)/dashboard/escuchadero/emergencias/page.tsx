import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Emergencias | Escuchadero" };

export default function EmergenciasEscuchaderoPage() {
  return (
    <section className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold text-mu-text">Emergencias</h1>
      <p className="rounded-xl border border-mu-border bg-white p-4 text-sm text-mu-text-muted">
        Consulta y gestiona las alertas abiertas desde la API clínica del Escuchadero.
      </p>
      <Link className="text-sm font-medium text-mu-primary" href="/dashboard/escuchadero">
        Volver al Escuchadero
      </Link>
    </section>
  );
}
