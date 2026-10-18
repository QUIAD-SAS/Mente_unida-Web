"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import { api } from "@/lib/api-client";
import type { DashboardData } from "@/lib/api/types";
import { getDisplayAlias } from "@/lib/auth/display";
import { useSession } from "@/lib/auth/session-context";
import { useAuthStore } from "@/lib/auth/store";
import {
  appointmentStatusLabel,
  formatAppointmentDate,
  formatCOP,
} from "@/lib/format";
import { Calendar, MessageSquare, Shield, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function PatientDashboardView() {
  const token = useAuthStore((s) => s.token)!;
  const { session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.dashboard.get(token).then(setData);
  }, [token]);

  const next = data?.upcomingEvents[0];
  const unread = data?.notifications.length ?? 0;
  const alias = getDisplayAlias(session) || data?.profileSummary.alias;
  const recommended = data?.recommendedPsychologists ?? [];
  const history = data?.appointments ?? [];

  return (
    <DashboardShell role="patient">
        <header>
          <h1 className="font-heading text-2xl font-bold text-mu-text">
            Hola, {alias ?? "…"}
          </h1>
          <p className="mt-1 text-mu-text-muted">
            Este es tu espacio personal. Aquí podrás gestionar tus citas,
            comunicarte con profesionales y avanzar a tu propio ritmo.
          </p>
        </header>

        {alias ? (
          <Card className="mt-6 border-mu-primary/20 bg-mu-accent/30">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 shrink-0 text-mu-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium text-mu-text">
                  Tu alias en la plataforma
                </p>
                <p className="mt-1 font-heading text-xl font-bold text-mu-primary">
                  {alias}
                </p>
                <p className="mt-1 text-sm text-mu-text-muted">
                  Los profesionales te identifican con este alias en consultas,
                  mensajes y videollamadas.
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        <PrivacyNotice className="mt-4" variant="compact" />

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-mu-primary/20 bg-mu-accent/30">
            {next ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="verified">
                      {appointmentStatusLabel(next.status)}
                    </Badge>
                    <CardTitle className="mt-3">Próxima cita</CardTitle>
                    <CardDescription className="mt-2 text-base text-mu-text">
                      {formatAppointmentDate(next.startAt)} —{" "}
                      {next.psychologist?.user.name ?? "Profesional"}
                    </CardDescription>
                    <p className="mt-1 text-sm text-mu-text-muted">
                      {next.modality === "ONLINE" ? "Online" : "Presencial"} ·{" "}
                      {next.payment
                        ? formatCOP(next.payment.amountCents)
                        : "Pago pendiente"}
                    </p>
                  </div>
                  <Calendar className="h-10 w-10 text-mu-primary" aria-hidden />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href="/app/paciente/citas">Ver mis citas</Button>
                  <Button variant="outline" href="/directorio">
                    Encontrar apoyo
                  </Button>
                </div>
              </>
            ) : (
              <>
                <CardTitle>No tienes citas próximas</CardTitle>
                <CardDescription className="mt-2">
                  Explora profesionales verificados y agenda tu primera sesión
                  cuando te sientas listo/a.
                </CardDescription>
                <Button className="mt-4" href="/directorio">
                  Encontrar apoyo profesional
                </Button>
              </>
            )}
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-mu-primary" aria-hidden />
              Notificaciones
            </CardTitle>
            <CardDescription className="mt-2">
              {unread > 0 ? `${unread} sin leer` : "Al día"}
            </CardDescription>
            {unread > 0 ? (
              <ul className="mt-4 space-y-2">
                {data?.notifications.slice(0, 5).map((n) => (
                  <li key={n.id} className="text-sm">
                    <p className="font-medium text-mu-text">{n.title}</p>
                    <p className="text-xs text-mu-text-muted">{n.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-mu-text-muted">
                Cuando haya novedades de tus citas, aparecerán aquí y en la
                campana.
              </p>
            )}
            <Button className="mt-4" variant="outline" href="/app/paciente/citas">
              Ver mis citas
            </Button>
          </Card>
        </div>

        <section className="mt-10" aria-labelledby="recommended-title">
          <h2
            id="recommended-title"
            className="font-heading text-lg font-semibold text-mu-text"
          >
            Profesionales que podrían acompañarte
          </h2>
          <p className="mt-1 text-sm text-mu-text-muted">
            Conoce su experiencia, enfoque y modalidad antes de dar el primer paso
          </p>
          {recommended.length === 0 ? (
            <p className="mt-4 text-sm text-mu-text-muted">
              No hay profesionales disponibles en este momento.
            </p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((p) => (
                <li key={p.id}>
                  <Card>
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <CardDescription>
                      {p.specialties[0] ?? "Salud mental"} · {p.city}
                    </CardDescription>
                    <p className="mt-2 inline-flex items-center gap-1 text-sm text-mu-text">
                      <Star
                        className="h-4 w-4 fill-mu-warning text-mu-warning"
                        aria-hidden
                      />
                      {p.ratingAvg.toFixed(1)}
                    </p>
                    <Link
                      href={`/directorio/${p.slug}`}
                      className="mt-4 inline-block text-sm font-medium text-mu-primary hover:underline"
                    >
                      Conocer al profesional
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10" aria-labelledby="history-title">
          <h2
            id="history-title"
            className="font-heading text-lg font-semibold text-mu-text"
          >
            Historial reciente
          </h2>
          <Card className="mt-4 overflow-x-auto">
            {history.length === 0 ? (
              <p className="p-4 text-sm text-mu-text-muted">
                Aún no tienes citas en tu historial.
              </p>
            ) : (
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-mu-border text-mu-text-muted">
                    <th className="pb-3 pr-4 font-medium">Fecha</th>
                    <th className="pb-3 pr-4 font-medium">Profesional</th>
                    <th className="pb-3 pr-4 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id} className="border-b border-mu-border/60">
                      <td className="py-3 pr-4">
                        {formatAppointmentDate(row.startAt)}
                      </td>
                      <td className="py-3 pr-4">
                        {row.psychologist?.user.name ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="verified">
                          {appointmentStatusLabel(row.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </section>
    </DashboardShell>
  );
}
