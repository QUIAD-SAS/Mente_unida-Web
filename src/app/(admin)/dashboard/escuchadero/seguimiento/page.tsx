import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Seguimiento | Escuchadero" };

export default function SeguimientoEscuchaderoPage() {
  return (
    <section className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold text-mu-text">Seguimiento</h1>
      <p className="rounded-xl border border-mu-border bg-white p-4 text-sm text-mu-text-muted">
        Revisa los seguimientos clínicos pendientes del Escuchadero.
      </p>
      <Link className="text-sm font-medium text-mu-primary" href="/dashboard/escuchadero">
        Volver al Escuchadero
      </Link>
    </section>
  );
}
