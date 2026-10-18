"use client";

import {
  monthRange,
  ScheduleCalendar,
} from "@/components/book-session/schedule-calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api-client";
import type { AvailabilitySlot, RecommendedPsychologist } from "@/lib/api/types";
import { normalizeAvailabilityDates } from "@/lib/book-session/normalize";
import { cn } from "@/lib/utils";
import { Loader2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ScheduleModalProps {
  open: boolean;
  psychologist: RecommendedPsychologist;
  onClose: () => void;
  onConfirm: (slot: AvailabilitySlot) => void;
}

export function ScheduleModal({
  open,
  psychologist,
  onClose,
  onConfirm,
}: ScheduleModalProps) {
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [availabilityDates, setAvailabilityDates] = useState<
    { date: string; slots: AvailabilitySlot[] }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );

  const availableDateKeys = useMemo(
    () => new Set(availabilityDates.map((d) => d.date)),
    [availabilityDates],
  );

  const slotsForSelectedDate = availabilityDates.find(
    (d) => d.date === selectedDate,
  )?.slots;

  const fetchAvailability = useCallback(
    async (month: Date) => {
      setLoading(true);
      setError(null);
      setSelectedDate(null);
      setSelectedSlot(null);
      try {
        const range = monthRange(month);
        const res = await api.availability.byPsychologist(psychologist.id, range);
        const dates = normalizeAvailabilityDates(res.dates ?? []);
        setAvailabilityDates(dates);
        if (dates[0]) {
          setSelectedDate(dates[0].date);
        }
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "No pudimos cargar la agenda",
        );
      } finally {
        setLoading(false);
      }
    },
    [psychologist.id],
  );

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    setCalendarMonth(now);
    void fetchAvailability(now);
  }, [open, fetchAvailability]);

  function handleMonthChange(month: Date) {
    setCalendarMonth(month);
    void fetchAvailability(month);
  }

  function handleConfirm() {
    if (!selectedSlot) {
      setError("Selecciona un horario.");
      return;
    }
    if (new Date(selectedSlot.startAt).getTime() <= Date.now()) {
      setError("Ese horario ya pasó. Elige otro disponible.");
      return;
    }
    onConfirm(selectedSlot);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
      onClick={onClose}
    >
      <Card
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-b-none p-4 sm:rounded-b-mu sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-mu p-1 text-mu-text-muted hover:bg-mu-accent hover:text-mu-text"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="schedule-modal-title"
          className="pr-8 font-heading text-base font-semibold"
        >
          Elegir fecha y hora
        </h2>
        <p className="mt-1 text-sm text-mu-text-muted">
          {psychologist.name ?? "Profesional"}
        </p>

        {error ? (
          <p
            className="mt-4 rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {loading && availabilityDates.length === 0 ? (
          <p className="mt-6 flex items-center gap-2 text-sm text-mu-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Cargando disponibilidad…
          </p>
        ) : (
          <>
            <div className="relative mt-4">
              {loading ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-mu bg-mu-surface/70">
                  <Loader2
                    className="h-5 w-5 animate-spin text-mu-primary"
                    aria-hidden
                  />
                </div>
              ) : null}
              <ScheduleCalendar
                compact
                month={calendarMonth}
                availableDates={availableDateKeys}
                selectedDate={selectedDate}
                loading={loading}
                onMonthChange={handleMonthChange}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                  setError(null);
                }}
              />
            </div>

            {availableDateKeys.size === 0 && !loading ? (
              <p className="mt-3 text-sm text-mu-text-muted">
                No hay horarios en este mes. Prueba otro mes con las flechas.
              </p>
            ) : null}

            {selectedDate && slotsForSelectedDate ? (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Hora</p>
                {slotsForSelectedDate.length === 0 ? (
                  <p className="text-sm text-mu-text-muted">
                    No quedan horarios libres para esta fecha.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slotsForSelectedDate.map((slot) => {
                      const time = new Intl.DateTimeFormat("es-CO", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }).format(new Date(slot.startAt));
                      const selected = selectedSlot?.id === slot.id;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setSelectedSlot(slot);
                            setError(null);
                          }}
                          className={cn(
                            "rounded-mu border px-3 py-1.5 text-sm transition-colors",
                            selected
                              ? "border-mu-primary bg-mu-primary text-white"
                              : "border-mu-border hover:border-mu-primary/40",
                          )}
                          aria-pressed={selected}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}

        <div className="mt-5 flex gap-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!selectedSlot || loading}
            onClick={handleConfirm}
          >
            Confirmar horario
          </Button>
        </div>
      </Card>
    </div>
  );
}
