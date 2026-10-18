"use client";

import { AppointmentSessionChatWidget } from "@/components/chat/appointment-session-chat-widget";
import { ConsultorioVideoPanel } from "@/components/consultorio/consultorio-video-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api-client";
import type { AppointmentItem } from "@/lib/api/types";
import { useAuthStore } from "@/lib/auth/store";
import { formatAppointmentDate } from "@/lib/format";
import { useEffect, useState } from "react";

export function PatientConsultorioView({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const token = useAuthStore((s) => s.token)!;
  const [appointment, setAppointment] = useState<AppointmentItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const appt = await api.appointments.getById(token, appointmentId);
        setAppointment(appt);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudo cargar el consultorio",
        );
      }
    }
    void load();
  }, [appointmentId, token]);

  const canJoin =
    appointment?.status === "CONFIRMED" ||
    appointment?.status === "IN_PROGRESS";

  return (
    <DashboardShell
      role="patient"
      contained
      mainClassName="flex flex-col overflow-hidden"
    >
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-mu-text">
            Consultorio
          </h1>
          <p className="mt-1 text-sm text-mu-text-muted">
            {appointment
              ? `${appointment.psychologist?.user.name ?? "Profesional"} · ${formatAppointmentDate(appointment.startAt)}`
              : "Cargando sesión…"}
          </p>
        </div>
        <Button variant="outline" href="/app/paciente/citas">
          Volver a mis citas
        </Button>
      </header>

      {error ? (
        <p className="mt-3 shrink-0 text-sm text-mu-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="relative mt-4 min-h-0 flex-1 overflow-hidden">
        {!appointment ? (
          <p className="text-sm text-mu-text-muted">Cargando…</p>
        ) : !canJoin ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-mu-text-muted">
              Esta cita no está disponible para el consultorio (
              {appointment.status === "PENDING"
                ? "aún pendiente de aprobación"
                : appointment.status === "CANCELLED"
                  ? "cancelada"
                  : "ya finalizada"}
              ).
            </p>
            <Button className="mt-4" href="/app/paciente/citas">
              Ir a mis citas
            </Button>
          </Card>
        ) : (
          <>
            <Card className="flex h-full min-h-64 flex-col overflow-hidden p-0">
              <ConsultorioVideoPanel
                appointmentId={appointmentId}
                className="min-h-0 flex-1"
              />
            </Card>
            <AppointmentSessionChatWidget
              appointmentId={appointmentId}
              ownSender="PATIENT"
              peerLabel={
                appointment.psychologist?.user.name ?? "Tu profesional"
              }
            />
          </>
        )}
      </div>
    </DashboardShell>
  );
}
