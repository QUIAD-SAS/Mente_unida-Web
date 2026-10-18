import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verificación profesional",
  robots: { index: false },
};

const DOCS = [
  { id: "id", label: "Documento de identidad", required: true },
  { id: "license", label: "Tarjeta profesional", required: true },
  { id: "certs", label: "Certificaciones", required: false },
];

export default function VerificationPage() {
  return (
    <div className="mu-section">
      <div className="mu-container max-w-xl">
        <Badge variant="pending">Pendiente</Badge>
        <h1 className="mt-4 font-heading text-2xl font-bold text-mu-text">
          Verificación profesional
        </h1>
        <p className="mt-2 text-mu-text-muted">
          Sube tus documentos para activar el badge Verificado y acceder a la
          comunidad.
        </p>

        <Card className="mt-8 space-y-6">
          {DOCS.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col gap-3 rounded-mu border border-dashed border-mu-border p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-mu-text">{doc.label}</p>
                {doc.required ? (
                  <p className="text-xs text-mu-text-muted">Obligatorio</p>
                ) : (
                  <p className="text-xs text-mu-text-muted">Opcional</p>
                )}
              </div>
              <Button variant="outline" type="button">
                Subir archivo
              </Button>
            </div>
          ))}
          <Button className="w-full">Enviar a revisión</Button>
        </Card>

        <p className="mt-6 text-center text-xs text-mu-text-muted">
          Estados: Pendiente · Verificado · Rechazado. Tiempo estimado de
          revisión: 48–72 h hábiles.
        </p>
      </div>
    </div>
  );
}
