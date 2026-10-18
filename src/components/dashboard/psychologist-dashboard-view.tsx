"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import type { DashboardData } from "@/lib/api/types";
import { getDisplayName } from "@/lib/auth/display";
import { useSession } from "@/lib/auth/session-context";
import { useAuthStore } from "@/lib/auth/store";
import { formatAppointmentDate, formatCOP } from "@/lib/format";
import { formatAge } from "@/lib/patient-utils";
import {
  Bot,
  Calendar,
  DollarSign,
  MessageSquare,
  Star,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNotificationsStore } from "@/lib/notifications/notifications-store";
import Link from "next/link";

export function PsychologistDashboardView() {
  const token = useAuthStore((s) => s.token)!;
  const { session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.dashboard.get(token).then(setData);
  }, [token]);

  const verified =
    session?.profile.psychologist?.verificationStatus === "APPROVED" ||
    data?.profileSummary.verificationStatus === "APPROVED";
  const planName = data?.profileSummary.planName ?? "Plan Gratuito";
  const stats = data?.stats;
  const todayAppointments = data?.upcomingEvents ?? [];
  const posts = data?.communityPosts ?? [];
  const notifications = useNotificationsStore((s) => s.items);
  const unreadNotifications = notifications.filter((n) => !n.readAt).slice(0, 5);
  const pendingRequests = todayAppointments.filter((a) => a.status === "PENDING");

  const statCards = stats
    ? [
        { label: "Citas hoy", value: String(stats.todayAppointments), icon: Calendar },
        {
          label: "Ingresos del mes",
          value: formatCOP(stats.monthRevenue),
          icon: DollarSign,
        },
        {
          label: "Valoración",
          value: stats.ratingAvg.toFixed(1),
          icon: Star,
        },
        {
          label: "Pacientes activos",
          value: String(stats.activePatients),
          icon: Users,
        },
      ]
    : [];

  return (
    <DashboardShell role="psychologist">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-mu-text">
              Hola, {getDisplayName(session).split(" ")[0]}
            </h1>
            <p className="mt-1 text-mu-text-muted">
              {new Intl.DateTimeFormat("es-CO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}{" "}
              · {planName}
            </p>
          </div>
          {verified ? (
            <Badge variant="verified">Verificado</Badge>
          ) : (
            <Badge variant="pending">Verificación pendiente</Badge>
          )}
        </header>

        <PrivacyNotice className="mt-6" variant="compact" />

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <li key={stat.label}>
              <Card>
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.label}</CardDescription>
                  <stat.icon className="h-5 w-5 text-mu-primary" aria-hidden />
                </div>
                <p className="mt-2 font-heading text-2xl font-bold text-mu-text">
                  {stat.value}
                </p>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardTitle>Próximas citas</CardTitle>
            {pendingRequests.length > 0 ? (
              <p className="mt-2 rounded-mu border border-mu-warning/30 bg-mu-warning/10 px-3 py-2 text-sm text-mu-text">
                Tienes {pendingRequests.length} solicitud
                {pendingRequests.length === 1 ? "" : "es"} pendiente
                {pendingRequests.length === 1 ? "" : "s"} de aprobación.{" "}
                <Link
                  href="/app/psicologo/agenda"
                  className="font-medium text-mu-primary hover:underline"
                >
                  Revisar en agenda
                </Link>
              </p>
            ) : null}
            <ul className="mt-4 space-y-3">
              {todayAppointments.length === 0 ? (
                <li className="text-sm text-mu-text-muted">
                  No hay citas próximas en tu agenda.
                </li>
              ) : (
                todayAppointments.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex items-center justify-between rounded-mu border border-mu-border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-mu-text">
                        {formatAppointmentDate(slot.startAt)}
                      </p>
                      <p className="text-sm text-mu-text-muted">
                        <span className="font-medium text-mu-primary">
                          {slot.patient?.alias ?? "Paciente"}
                        </span>
                        {slot.patient?.age != null
                          ? ` · ${formatAge(slot.patient.age)}`
                          : ""}
                        {slot.patient?.city ? ` · ${slot.patient.city}` : ""}
                        {" · "}
                        {slot.modality === "ONLINE" ? "Online" : "Presencial"}
                      </p>
                    </div>
                    <Badge variant="verified">
                      {slot.status === "PENDING" ? "Pendiente" : "Programada"}
                    </Badge>
                  </li>
                ))
              )}
            </ul>
            <Button
              className="mt-4"
              variant="outline"
              href="/app/psicologo/agenda"
            >
              Ver agenda completa
            </Button>
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-mu-primary" aria-hidden />
              Notificaciones
            </CardTitle>
            <CardDescription className="mt-2">
              {unreadNotifications.length > 0
                ? `${unreadNotifications.length} sin leer`
                : "Al día"}
            </CardDescription>
            {unreadNotifications.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {unreadNotifications.map((n) => (
                  <li key={n.id} className="text-sm text-mu-text-muted">
                    <span className="font-medium text-mu-text">{n.title}</span>
                    <span className="mt-0.5 block text-xs">{n.body}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-mu-text-muted">
                Cuando un paciente agende una cita, lo verás aquí y en la
                campana.
              </p>
            )}
            <Button
              className="mt-4"
              variant="outline"
              href="/app/psicologo/agenda"
            >
              Ir a agenda
            </Button>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="border-mu-primary/20 lg:col-span-1">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-mu-primary" aria-hidden />
              Consultorio virtual
            </CardTitle>
            <CardDescription className="mt-2">
              {todayAppointments[0]
                ? `Próxima: ${formatAppointmentDate(todayAppointments[0].startAt)}`
                : "Sin sesiones programadas"}
            </CardDescription>
            <Button
              className="mt-6 w-full"
              variant="outline"
              href="/app/psicologo/consultorio"
            >
              Ir al consultorio
            </Button>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardTitle>Comunidad</CardTitle>
            <CardDescription className="mt-2">
              {posts.length > 0
                ? `${posts.length} publicaciones recientes en el feed`
                : "Participa en conversaciones clínicas, comparte experiencias y aprende junto a otros profesionales de la salud mental."}
            </CardDescription>
            <Button className="mt-4" variant="outline" href="/app/psicologo/comunidad">
              Ir a comunidad
            </Button>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-mu-secondary" aria-hidden />
              Apoyo para tu práctica
            </CardTitle>
            <CardDescription className="mt-2">
              Organiza notas de sesión con herramientas que respetan tu criterio
              profesional.
            </CardDescription>
            <Button variant="ghost" className="mt-4" disabled>
              Próximamente
            </Button>
          </Card>
        </div>
    </DashboardShell>
  );
}
