"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppModal } from "@/components/ui/app-modal";
import { api, ApiError } from "@/lib/api-client";
import type { AppointmentItem } from "@/lib/api/types";
import { useAuthStore } from "@/lib/auth/store";
import { useNotificationsStore } from "@/lib/notifications/notifications-store";
import { appointmentStatusLabel, formatAppointmentDate } from "@/lib/format";
import { formatAge } from "@/lib/patient-utils";
import { cn } from "@/lib/utils";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_HOUR_START = 0; // 12 AM
const DEFAULT_HOUR_END = 12; // 12 PM
const HOUR_ROW_PX = 56;

function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function appointmentPosition(
  appt: AppointmentItem,
  hourStart: number,
  hourEnd: number,
) {
  const start = new Date(appt.startAt);
  const end = new Date(appt.endAt);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const rangeStart = hourStart * 60;
  const rangeEnd = (hourEnd + 1) * 60;
  const top =
    ((Math.max(startMinutes, rangeStart) - rangeStart) /
      (rangeEnd - rangeStart)) *
    100;
  const bottom =
    ((Math.min(endMinutes, rangeEnd) - rangeStart) / (rangeEnd - rangeStart)) *
    100;
  return {
    top: `${Math.max(0, top)}%`,
    height: `${Math.max(3, bottom - top)}%`,
  };
}

function formatHourLabel(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function hoursForDay(appointments: AppointmentItem[]) {
  let start = DEFAULT_HOUR_START;
  let end = DEFAULT_HOUR_END;

  for (const appt of appointments) {
    const s = new Date(appt.startAt);
    const e = new Date(appt.endAt);
    start = Math.min(start, s.getHours());
    const endHour =
      e.getMinutes() === 0 && e.getSeconds() === 0
        ? Math.max(e.getHours() - 1, s.getHours())
        : e.getHours();
    end = Math.max(end, endHour, s.getHours());
  }

  start = Math.max(0, start);
  end = Math.min(23, Math.max(end, start));

  return { start, end };
}

export function PsychologistAgendaView() {
  const token = useAuthStore((s) => s.token)!;
  const refreshNotifications = useNotificationsStore((s) => s.refresh);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentItem | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleValue, setRescheduleValue] = useState("");
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const list = await api.appointments.list(token, { limit: "100" });
      const items = (list.items ?? []).filter(
        (a) => a.status !== "CANCELLED" && a.status !== "COMPLETED",
      );
      setAppointments(items);
      void refreshNotifications(token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar agenda");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => isSameDay(new Date(a.startAt), selectedDay))
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [appointments, selectedDay],
  );

  const { start: hourStart, end: hourEnd } = useMemo(
    () => hoursForDay(dayAppointments),
    [dayAppointments],
  );
  const hours = useMemo(
    () =>
      Array.from({ length: hourEnd - hourStart + 1 }, (_, i) => hourStart + i),
    [hourStart, hourEnd],
  );

  const daysWithAppointments = useMemo(() => {
    const keys = new Set(
      appointments.map((a) => dayKey(new Date(a.startAt))),
    );
    return keys;
  }, [appointments]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [monthCursor]);

  useEffect(() => {
    if (!selectedAppointment) return;
    const fresh = appointments.find((a) => a.id === selectedAppointment.id);
    setSelectedAppointment(fresh ?? null);
  }, [appointments, selectedAppointment?.id]);

  async function handleApprove(id: string) {
    setActionLoading(id);
    setError(null);
    setFeedback(null);
    try {
      await api.appointments.confirm(token, id);
      setFeedback("Cita aprobada. El paciente fue notificado.");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo aprobar");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(reason: string) {
    if (!rejectTargetId) return;
    setActionLoading(rejectTargetId);
    setError(null);
    setFeedback(null);
    try {
      await api.appointments.cancel(token, rejectTargetId, reason);
      setFeedback("Cita rechazada. El paciente fue notificado.");
      setSelectedAppointment(null);
      setRejectTargetId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo rechazar");
    } finally {
      setActionLoading(null);
    }
  }

  function openReject(id: string) {
    setRejectTargetId(id);
  }

  function openReschedule(appt: AppointmentItem) {
    setSelectedAppointment(appt);
    setRescheduleValue(toLocalInputValue(appt.startAt));
    setRescheduleOpen(true);
  }

  async function submitReschedule() {
    if (!selectedAppointment || !rescheduleValue) return;
    const start = new Date(rescheduleValue);
    if (Number.isNaN(start.getTime())) {
      setError("Fecha u hora inválida");
      return;
    }
    const duration =
      new Date(selectedAppointment.endAt).getTime() -
      new Date(selectedAppointment.startAt).getTime();
    const end = new Date(start.getTime() + Math.max(duration, 30 * 60_000));

    setActionLoading(selectedAppointment.id);
    setError(null);
    setFeedback(null);
    try {
      await api.appointments.proposeReschedule(token, selectedAppointment.id, {
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        timezone: "America/Bogota",
      });
      setFeedback(
        "Propuesta enviada. El paciente debe aceptar o rechazar el nuevo horario.",
      );
      setRescheduleOpen(false);
      setSelectedDay(start);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo reagendar");
    } finally {
      setActionLoading(null);
    }
  }

  const now = new Date();
  const showNowLine = isSameDay(selectedDay, now);
  const nowTop = (() => {
    const minutes = now.getHours() * 60 + now.getMinutes();
    const rangeStart = hourStart * 60;
    const rangeEnd = (hourEnd + 1) * 60;
    if (minutes < rangeStart || minutes > rangeEnd) return null;
    return `${((minutes - rangeStart) / (rangeEnd - rangeStart)) * 100}%`;
  })();

  return (
    <DashboardShell
      role="psychologist"
      contained
      mainClassName="flex flex-col overflow-hidden"
    >
      <header className="shrink-0">
        <h1 className="font-heading text-2xl font-bold text-mu-text">Agenda</h1>
        <p className="mt-1 text-mu-text-muted">
          Citas programadas y horarios de disponibilidad.
        </p>
      </header>

      {error ? (
        <p
          className="mt-3 shrink-0 rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {feedback ? (
        <p
          className="mt-3 shrink-0 rounded-mu border border-mu-success/30 bg-mu-success/5 px-3 py-2 text-sm text-mu-success"
          role="status"
        >
          {feedback}
        </p>
      ) : null}

      <section className="mt-4 grid min-h-0 flex-1 gap-4 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        {/* Mini calendar */}
        <Card className="h-fit shrink-0 p-4 xl:max-h-full xl:overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold capitalize text-mu-text">
              {format(monthCursor, "MMMM yyyy", { locale: es })}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mu-text-muted hover:bg-mu-accent"
                onClick={() => setMonthCursor((m) => subMonths(m, 1))}
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mu-text-muted hover:bg-mu-accent"
                onClick={() => setMonthCursor((m) => addMonths(m, 1))}
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-mu-text-muted">
            {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const selected = isSameDay(day, selectedDay);
              const inMonth = isSameMonth(day, monthCursor);
              const hasAppt = daysWithAppointments.has(dayKey(day));
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day);
                    setMonthCursor(startOfMonth(day));
                  }}
                  className={cn(
                    "relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                    !inMonth && "text-mu-text-muted/40",
                    inMonth && !selected && "text-mu-text hover:bg-mu-accent",
                    selected && "bg-mu-primary font-semibold text-white",
                    !selected && isToday(day) && "ring-1 ring-mu-primary",
                  )}
                >
                  {format(day, "d")}
                  {hasAppt && !selected ? (
                    <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-mu-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Day timeline */}
        <Card className="flex min-h-0 flex-col overflow-hidden p-0">
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-mu-border px-4 py-3">
            <div className="flex h-10 w-10 flex-col items-center justify-center rounded-full bg-mu-primary text-white">
              <span className="text-[9px] font-semibold uppercase leading-none">
                {format(selectedDay, "EEE", { locale: es })}
              </span>
              <span className="text-sm font-bold leading-none">
                {format(selectedDay, "d")}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setSelectedDay(today);
                setMonthCursor(startOfMonth(today));
              }}
            >
              Hoy
            </Button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-mu-text-muted hover:bg-mu-accent"
              onClick={() =>
                setSelectedDay(
                  (d) =>
                    new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1),
                )
              }
              aria-label="Día anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-mu-text-muted hover:bg-mu-accent"
              onClick={() =>
                setSelectedDay(
                  (d) =>
                    new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
                )
              }
              aria-label="Día siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium capitalize text-mu-text">
              {format(selectedDay, "EEEE d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div
              className="relative flex min-w-[380px]"
              style={{ height: hours.length * HOUR_ROW_PX }}
            >
              <div className="sticky left-0 z-[1] w-16 shrink-0 border-r border-mu-border bg-white">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="flex items-start justify-end pr-2 pt-1 text-[11px] text-mu-text-muted"
                    style={{ height: HOUR_ROW_PX }}
                  >
                    {formatHourLabel(hour)}
                  </div>
                ))}
              </div>

              <div className="relative flex-1">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-mu-border/80"
                    style={{ height: HOUR_ROW_PX }}
                  />
                ))}

                <div className="absolute inset-x-2 inset-y-0">
                  {loading ? (
                    <p className="p-8 text-sm text-mu-text-muted">Cargando…</p>
                  ) : (
                    dayAppointments.map((appt) => {
                      const pos = appointmentPosition(appt, hourStart, hourEnd);
                      const selected = selectedAppointment?.id === appt.id;
                      return (
                        <button
                          key={appt.id}
                          type="button"
                          onClick={() => setSelectedAppointment(appt)}
                          style={{ top: pos.top, height: pos.height }}
                          className={cn(
                            "absolute left-0 right-0 overflow-hidden rounded-lg px-2 py-1 text-left text-xs font-medium text-white shadow-sm transition-opacity",
                            selected
                              ? "bg-mu-primary-dark ring-2 ring-mu-primary ring-offset-1"
                              : "bg-mu-primary hover:opacity-90",
                          )}
                        >
                          <span className="line-clamp-2">
                            {appt.patient?.alias ?? "Paciente"}
                          </span>
                          <span className="mt-0.5 block text-[10px] font-normal opacity-90">
                            {format(new Date(appt.startAt), "h:mm a")} ·{" "}
                            {appt.hasRescheduleProposal
                              ? "Reagendo pend."
                              : appointmentStatusLabel(appt.status)}
                          </span>
                        </button>
                      );
                    })
                  )}

                  {showNowLine && nowTop ? (
                    <div
                      className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                      style={{ top: nowTop }}
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-mu-error" />
                      <span className="h-0.5 flex-1 bg-mu-error" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Detail panel */}
        <Card className="flex min-h-0 flex-col overflow-hidden p-5 xl:max-h-full">
          <h2 className="shrink-0 font-heading text-lg font-semibold text-mu-text">
            Detalle de cita
          </h2>
          {!selectedAppointment ? (
            <p className="mt-4 text-sm text-mu-text-muted">
              Selecciona una cita para ver la información del paciente.
            </p>
          ) : (
            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto text-sm">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="verified">
                  {appointmentStatusLabel(selectedAppointment.status)}
                </Badge>
                <span className="text-xs text-mu-text-muted">
                  {selectedAppointment.modality === "ONLINE"
                    ? "Online"
                    : "Presencial"}
                </span>
              </div>
              <p>
                <span className="font-medium">Paciente:</span>{" "}
                {selectedAppointment.patient?.alias ?? "Paciente"}
                {selectedAppointment.patient?.age != null
                  ? ` · ${formatAge(selectedAppointment.patient.age)}`
                  : ""}
              </p>
              <p>
                <span className="font-medium">Fecha:</span>{" "}
                {formatAppointmentDate(selectedAppointment.startAt)}
              </p>
              {selectedAppointment.hasRescheduleProposal &&
              selectedAppointment.proposedStartAt ? (
                <div className="rounded-mu border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                  <p className="font-medium">Propuesta pendiente de respuesta</p>
                  <p className="mt-1 text-xs">
                    Nuevo horario propuesto:{" "}
                    {formatAppointmentDate(selectedAppointment.proposedStartAt)}
                  </p>
                </div>
              ) : null}
              <p>
                <span className="font-medium">Ciudad:</span>{" "}
                {selectedAppointment.patient?.city ?? "No registrada"}
              </p>
              <p>
                <span className="font-medium">Motivo:</span>{" "}
                {selectedAppointment.patient?.consultationReason ??
                  "No registrado"}
              </p>
              <p>
                <span className="font-medium">Bienestar:</span>{" "}
                {selectedAppointment.patient?.wellbeingFeeling ??
                  "No registrado"}
              </p>
              <p>
                <span className="font-medium">Enfoque:</span>{" "}
                {selectedAppointment.patient?.workOnFocus ?? "No registrado"}
              </p>

              {selectedAppointment.status === "PENDING" ? (
                <div className="grid gap-2 pt-2">
                  <Button
                    type="button"
                    disabled={actionLoading === selectedAppointment.id}
                    onClick={() => void handleApprove(selectedAppointment.id)}
                  >
                    {actionLoading === selectedAppointment.id
                      ? "Procesando…"
                      : "Aprobar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={actionLoading === selectedAppointment.id}
                    onClick={() => openReschedule(selectedAppointment)}
                  >
                    Reagendar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={actionLoading === selectedAppointment.id}
                    onClick={() => openReject(selectedAppointment.id)}
                  >
                    Rechazar
                  </Button>
                </div>
              ) : null}

              {["CONFIRMED", "IN_PROGRESS"].includes(
                selectedAppointment.status,
              ) ? (
                <div className="grid gap-2 pt-2">
                  <Button
                    href={`/app/psicologo/consultorio/${selectedAppointment.id}`}
                  >
                    Ir al consultorio
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={actionLoading === selectedAppointment.id}
                    onClick={() => openReschedule(selectedAppointment)}
                  >
                    Reagendar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={actionLoading === selectedAppointment.id}
                    onClick={() => openReject(selectedAppointment.id)}
                  >
                    Rechazar
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </Card>
      </section>

      <AppModal
        open={Boolean(rejectTargetId)}
        title="Rechazar cita"
        description="El paciente será notificado. Si cierras o cancelas este diálogo, la cita no se rechaza."
        onClose={() => {
          if (!actionLoading) setRejectTargetId(null);
        }}
        reason={{
          label: "Motivo del rechazo",
          placeholder: "Explica brevemente por qué no puedes atender esta cita…",
          required: true,
          minLength: 3,
        }}
        primaryAction={{
          label: "Confirmar rechazo",
          variant: "destructive",
          loading: Boolean(actionLoading && rejectTargetId),
          onClick: (reason) => {
            void handleReject(reason);
          },
        }}
        secondaryAction={{ label: "Volver" }}
      />

      <AppModal
        open={rescheduleOpen && Boolean(selectedAppointment)}
        title="Proponer reagendo"
        description="Se enviará al paciente una propuesta. La cita no cambia hasta que acepte. Si rechaza, la cita se cancela y podrá agendar otra."
        onClose={() => {
          if (!actionLoading) setRescheduleOpen(false);
        }}
        primaryAction={{
          label: "Enviar propuesta",
          loading: Boolean(
            actionLoading && selectedAppointment && rescheduleOpen,
          ),
          onClick: () => {
            void submitReschedule();
          },
        }}
        secondaryAction={{ label: "Volver" }}
      >
        <label className="block text-sm font-medium text-mu-text">
          Nueva fecha y hora propuesta
          <input
            type="datetime-local"
            value={rescheduleValue}
            onChange={(e) => setRescheduleValue(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-mu border border-mu-border px-3 text-sm"
          />
        </label>
      </AppModal>
    </DashboardShell>
  );
}
