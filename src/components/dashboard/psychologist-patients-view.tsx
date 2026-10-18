"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import { api, ApiError } from "@/lib/api-client";
import type { PatientPsychologistView } from "@/lib/api/types";
import { useAuthStore } from "@/lib/auth/store";
import { formatAge } from "@/lib/patient-utils";
import { useEffect, useState } from "react";

export function PsychologistPatientsView() {
  const token = useAuthStore((s) => s.token)!;
  const [patients, setPatients] = useState<PatientPsychologistView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.psychologists
      .patients(token, { limit: "50" })
      .then((res) => setPatients(res.items))
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Error al cargar pacientes",
        ),
      )
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <DashboardShell role="psychologist">
        <header>
          <h1 className="font-heading text-2xl font-bold text-mu-text">
            Pacientes
          </h1>
          <p className="mt-1 text-mu-text-muted">
            Vista anonimizada. Solo verás alias e información compartida relevante.
          </p>
        </header>

        <PrivacyNotice className="mt-6" variant="compact" />

        {error ? (
          <p className="mt-4 rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-8 text-sm text-mu-text-muted">Cargando pacientes…</p>
        ) : patients.length === 0 ? (
          <Card className="mt-8">
            <CardDescription>
              Aún no tienes pacientes asignados.
            </CardDescription>
          </Card>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patients.map((p) => (
              <li key={p.id}>
                <Card>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base text-mu-primary">
                      {p.alias}
                    </CardTitle>
                    <Badge variant="verified">Protegido</Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-mu-text-muted">
                    {p.age != null ? <p>{formatAge(p.age)}</p> : null}
                    {p.city ? <p>{p.city}</p> : null}
                    {p.consultationReason ? (
                      <p className="line-clamp-2">{p.consultationReason}</p>
                    ) : null}
                    {p.totalAppointments != null ? (
                      <p className="text-xs">
                        {p.totalAppointments} cita(s) en total
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    href={`/app/psicologo/mensajes?patientId=${p.id}`}
                  >
                    Mensaje
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
    </DashboardShell>
  );
}
