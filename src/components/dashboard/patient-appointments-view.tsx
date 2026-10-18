"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { AppModal } from "@/components/ui/app-modal";
import { api, ApiError } from "@/lib/api-client";
import type { AppointmentItem } from "@/lib/api/types";
import { useAuthStore } from "@/lib/auth/store";
import { useNotificationsStore } from "@/lib/notifications/notifications-store";
import {
  appointmentStatusLabel,
  formatAppointmentDate,
  formatCOP,
} from "@/lib/format";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function PatientAppointmentsView() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token)!;
  const notifications = useNotificationsStore((s) => s.items);
  const markRead = useNotificationsStore((s) => s.markRead);
  const [upcoming, setUpcoming] = useState<AppointmentItem[]>([]);
  const [history, setHistory] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<AppointmentItem | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [rejectAlertOpen, setRejectAlertOpen] = useState(false);

  const appointmentNotifications = useMemo(
    () => notifications.filter((n) => n.type === "APPOINTMENT"),
    [notifications],
  );

  async function load() {
    setLoading(true);
    try {
      const [up, hist] = await Promise.all([
        api.appointments.upcoming(token),
        api.appointments.list(token, { limit: "50" }),
      ]);
      setUpcoming(up);
      setHistory(hist.items ?? []);
      setSelected((prev) => {
        if (!prev) return null;
        const fromUp = up.find((a) => a.id === prev.id);
        if (fromUp) return fromUp;
        const fromHist = (hist.items ?? []).find((a) => a.id === prev.id);
        return fromHist ?? null;
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar citas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function confirmCancel(reason: string) {
    if (!cancelTargetId) return;
    setCancelling(true);
    setError(null);
    try {
      await api.appointments.cancel(token, cancelTargetId, reason);
      if (selected?.id === cancelTargetId) setSelected(null);
      setCancelTargetId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cancelar");
    } finally {
      setCancelling(false);
    }
  }

  async function handleAcceptReschedule(id: string) {
    setRespondingId(id);
    setError(null);
    try {
      await api.appointments.acceptReschedule(token, id);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo aceptar el reagendo",
      );
    } finally {
      setRespondingId(null);
    }
  }

  async function handleRejectReschedule(id: string) {
    setRespondingId(id);
    setError(null);
    try {
      await api.appointments.rejectReschedule(token, id);
      setRejectAlertOpen(true);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo rechazar el reagendo",
      );
    } finally {
      setRespondingId(null);
    }
  }

  function hasProposal(appt: AppointmentItem) {
    return Boolean(
      appt.hasRescheduleProposal ||
        (appt.proposedStartAt && appt.proposedEndAt),
    );
  }

  return (
    <DashboardShell
      role="patient"
      contained
      mainClassName="flex flex-col overflow-hidden"
    >
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-mu-text">
            Mis citas
          </h1>
          <p className="mt-1 text-sm text-mu-text-muted">
            Gestiona tus sesiones programadas y tu historial.
          </p>
        </div>
        <Button href="/app/book-session">Agendar cita</Button>
      </header>

      {error ? (
        <p
          className="mt-3 shrink-0 rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Actualizaciones */}
        <section
          className="flex min-h-0 flex-col overflow-hidden rounded-mu border border-mu-border bg-white"
          aria-labelledby="notif-title"
        >
          <div className="shrink-0 border-b border-mu-border px-4 py-3">
            <h2
              id="notif-title"
              className="font-heading text-base font-semibold text-mu-text"
            >
              Actualizaciones
            </h2>
            <p className="text-xs text-mu-text-muted">
              Aprobaciones, cambios y cancelaciones
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
            {appointmentNotifications.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-mu-text-muted">
                Sin actualizaciones por ahora.
              </p>
            ) : (
              <ul className="space-y-2">
                {appointmentNotifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!n.readAt) void markRead(token, n.id);
                      }}
                      className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                        n.readAt
                          ? "border-mu-border bg-white"
                          : "border-mu-primary/30 bg-mu-accent/50"
                      }`}
                    >
                      <p className="font-medium text-mu-text">{n.title}</p>
                      <p className="mt-1 text-xs text-mu-text-muted">{n.body}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Próximas + detalle */}
        <section
          className="flex min-h-0 flex-col overflow-hidden rounded-mu border border-mu-border bg-white"
          aria-labelledby="upcoming-title"
        >
          <div className="shrink-0 border-b border-mu-border px-4 py-3">
            <h2
              id="upcoming-title"
              className="font-heading text-base font-semibold text-mu-text"
            >
              Próximas
            </h2>
            <p className="text-xs text-mu-text-muted">
              Selecciona una cita para ver el detalle
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
            {loading ? (
              <p className="py-6 text-center text-sm text-mu-text-muted">
                Cargando…
              </p>
            ) : upcoming.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardDescription>No tienes citas próximas.</CardDescription>
                <Button className="mt-3" size="sm" href="/app/book-session">
                  Agendar cita
                </Button>
              </Card>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((appt) => (
                  <li key={appt.id}>
                    <Card
                      className={`cursor-pointer shadow-none transition-shadow hover:shadow-sm ${
                        selected?.id === appt.id
                          ? "border-mu-primary ring-1 ring-mu-primary/30"
                          : ""
                      }`}
                      onClick={() => setSelected(appt)}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="verified">
                              {appointmentStatusLabel(appt.status)}
                            </Badge>
                            {hasProposal(appt) ? (
                              <Badge variant="verified">Reagendo pendiente</Badge>
                            ) : null}
                          </div>
                          <CardTitle className="mt-2 text-sm">
                            {formatAppointmentDate(appt.startAt)}
                          </CardTitle>
                          <CardDescription className="mt-1 text-xs">
                            {appt.psychologist?.user.name ?? "Profesional"} ·{" "}
                            {appt.modality === "ONLINE"
                              ? "Virtual"
                              : "Presencial"}
                            {appt.payment
                              ? ` · ${formatCOP(appt.payment.amountCents)}`
                              : ""}
                          </CardDescription>
                          {appt.status === "PENDING" && !hasProposal(appt) ? (
                            <p className="mt-2 text-xs text-amber-700">
                              Esperando aprobación del profesional.
                            </p>
                          ) : null}
                          {hasProposal(appt) && appt.proposedStartAt ? (
                            <p className="mt-2 text-xs text-amber-800">
                              Propuesta:{" "}
                              {formatAppointmentDate(appt.proposedStartAt)}.
                              Debes aceptar o rechazar.
                            </p>
                          ) : null}
                        </div>
                        {appt.status !== "CANCELLED" &&
                        appt.status !== "COMPLETED" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={cancelling || respondingId === appt.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelected(appt);
                              setCancelTargetId(appt.id);
                            }}
                          >
                            Cancelar
                          </Button>
                        ) : null}
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}

            {selected ? (
              <Card className="mt-4 shadow-none">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-base font-semibold">
                      Detalle de la cita
                    </h3>
                    <p className="mt-1 text-xs text-mu-text-muted">
                      {selected.psychologist?.user.name ?? "Profesional"} ·{" "}
                      {formatAppointmentDate(selected.startAt)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(null)}
                  >
                    Cerrar
                  </Button>
                </div>

                {hasProposal(selected) && selected.proposedStartAt ? (
                  <div className="mt-3 rounded-mu border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                    <p className="font-medium">Propuesta de reagendamiento</p>
                    <p className="mt-1 text-xs">
                      Horario actual: {formatAppointmentDate(selected.startAt)}
                    </p>
                    <p className="mt-0.5 text-xs">
                      Nuevo horario propuesto:{" "}
                      {formatAppointmentDate(selected.proposedStartAt)}
                    </p>
                    <p className="mt-2 text-xs text-amber-900/80">
                      Si no puedes en esa fecha, rechaza la propuesta: la cita
                      actual se cancelará y podrás agendar una nueva.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={respondingId === selected.id}
                        onClick={() => void handleAcceptReschedule(selected.id)}
                      >
                        {respondingId === selected.id
                          ? "Procesando…"
                          : "Aceptar horario"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={respondingId === selected.id}
                        onClick={() => void handleRejectReschedule(selected.id)}
                      >
                        No puedo / Rechazar
                      </Button>
                    </div>
                  </div>
                ) : null}

                {selected.status === "CANCELLED" ? (
                  <div className="mt-3 rounded-mu bg-mu-background p-3 text-sm">
                    <p>
                      <span className="font-medium">Motivo:</span>{" "}
                      {selected.cancelReason ?? "No se registró un motivo."}
                    </p>
                    <Button className="mt-3" size="sm" href="/app/book-session">
                      Buscar otra cita
                    </Button>
                  </div>
                ) : selected.status === "CONFIRMED" ||
                  selected.status === "IN_PROGRESS" ? (
                  !hasProposal(selected) ? (
                    <div className="mt-3 space-y-3">
                      <div className="rounded-mu border border-mu-primary/20 bg-mu-accent/40 p-3">
                        <p className="text-sm text-mu-text">
                          Tu cita está lista. Entra al consultorio para la
                          sesión con tu profesional.
                        </p>
                        <Button
                          className="mt-3"
                          size="sm"
                          href={`/app/paciente/consultorio/${selected.id}`}
                        >
                          Ir al consultorio
                        </Button>
                      </div>
                    </div>
                  ) : null
                ) : !hasProposal(selected) ? (
                  <p className="mt-3 text-sm text-mu-text-muted">
                    Tu solicitud está pendiente. Cuando el profesional apruebe,
                    proponga un reagendo o rechace la cita, verás la
                    actualización aquí y en la campana.
                  </p>
                ) : null}
              </Card>
            ) : null}
          </div>
        </section>

        {/* Historial */}
        <section
          className="flex min-h-0 flex-col overflow-hidden rounded-mu border border-mu-border bg-white lg:col-span-2 xl:col-span-1"
          aria-labelledby="history-title"
        >
          <div className="shrink-0 border-b border-mu-border px-4 py-3">
            <h2
              id="history-title"
              className="font-heading text-base font-semibold text-mu-text"
            >
              Historial
            </h2>
            <p className="text-xs text-mu-text-muted">
              Consultas anteriores y estados
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
            {history.length === 0 ? (
              <p className="py-6 text-center text-sm text-mu-text-muted">
                Sin historial aún.
              </p>
            ) : (
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-mu-border text-mu-text-muted">
                    <th className="pb-2 pr-2 font-medium">Fecha</th>
                    <th className="pb-2 pr-2 font-medium">Profesional</th>
                    <th className="pb-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-b border-mu-border/60 hover:bg-mu-accent/40"
                      onClick={() => setSelected(row)}
                    >
                      <td className="py-2.5 pr-2 align-top text-xs">
                        {formatAppointmentDate(row.startAt)}
                      </td>
                      <td className="py-2.5 pr-2 align-top text-xs">
                        {row.psychologist?.user.name ?? "—"}
                      </td>
                      <td className="py-2.5 align-top">
                        <Badge variant="verified">
                          {appointmentStatusLabel(row.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <AppModal
        open={Boolean(cancelTargetId)}
        title="Cancelar cita"
        description="Indica el motivo. Si cierras o cancelas este diálogo, la cita no se cancela."
        onClose={() => {
          if (!cancelling) setCancelTargetId(null);
        }}
        reason={{
          label: "Motivo de la cancelación",
          placeholder: "Ej. no puedo asistir en ese horario…",
          required: true,
          minLength: 3,
        }}
        primaryAction={{
          label: "Confirmar cancelación",
          variant: "destructive",
          loading: cancelling,
          onClick: (reason) => {
            void confirmCancel(reason);
          },
        }}
        secondaryAction={{
          label: "Volver",
        }}
      />

      <AppModal
        open={rejectAlertOpen}
        title="Propuesta rechazada"
        description="Se rechazó la petición de reagendamiento y la cita quedó cancelada. Puedes agendar una nueva cita cuando quieras."
        onClose={() => setRejectAlertOpen(false)}
        primaryAction={{
          label: "Agendar cita",
          onClick: () => {
            setRejectAlertOpen(false);
            router.push("/app/book-session");
          },
        }}
        secondaryAction={{
          label: "Cerrar",
        }}
      />
    </DashboardShell>
  );
}
