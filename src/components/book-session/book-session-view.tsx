"use client";

import { BookSessionSteps } from "@/components/book-session/book-session-steps";
import { RecommendedPsychologistCard } from "@/components/book-session/recommended-psychologist-card";
import { ScheduleModal } from "@/components/book-session/schedule-modal";
import { FormSection } from "@/components/scheduling/form-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormTextarea } from "@/components/ui/form-field";
import { api, ApiError } from "@/lib/api-client";
import type {
  AvailabilitySlot,
  BookSessionFormData,
  EmotionalState,
  RecommendedPsychologist,
} from "@/lib/api/types";
import {
  ACCOMPANIMENT_REASON_OPTIONS,
  accompanimentReasonLabel,
} from "@/lib/book-session/constants";
import {
  buildAppointmentNotes,
  normalizeRecommendedPsychologist,
  type ApiRecommendedPsychologist,
} from "@/lib/book-session/normalize";
import { useAuthStore } from "@/lib/auth/store";
import { formatAppointmentDate, formatCOP } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const EMOTIONAL_STATE_OPTIONS: { value: EmotionalState; label: string }[] = [
  { value: "BIEN", label: "Bien" },
  { value: "SOBRECARGADO", label: "Sobrecargado" },
  { value: "TRISTE", label: "Triste" },
  { value: "ANSIOSO", label: "Ansioso" },
  { value: "DESBORDADO", label: "Desbordado" },
];

const INITIAL_FORM: BookSessionFormData = {
  accompanimentReason: "",
  description: "",
  modality: null,
  emotionalState: "",
};

type PrivacyChoice = "YES" | "NO" | "DISCUSS";

interface BookSessionViewProps {
  initialPsychologistId?: string | null;
}

export function BookSessionView({
  initialPsychologistId = null,
}: BookSessionViewProps) {
  const token = useAuthStore((s) => s.token)!;
  const alias = useAuthStore((s) => s.user?.alias);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BookSessionFormData>(INITIAL_FORM);

  const [psychologists, setPsychologists] = useState<RecommendedPsychologist[]>(
    [],
  );
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  const [selectedPsychologistId, setSelectedPsychologistId] = useState<
    string | null
  >(initialPsychologistId);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [scheduleModalPsychologist, setScheduleModalPsychologist] =
    useState<RecommendedPsychologist | null>(null);

  const [privacyChoice, setPrivacyChoice] = useState<PrivacyChoice | null>(
    null,
  );
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteLoadingId, setFavoriteLoadingId] = useState<string | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const selectedPsychologist = psychologists.find(
    (p) => p.id === selectedPsychologistId,
  );

  const loadFavorites = useCallback(async () => {
    try {
      const res = await api.favorites.list(token);
      setFavoriteIds(new Set(res.items.map((f) => f.psychologistId)));
    } catch {
      /* favoritos opcionales si el endpoint aún no está disponible */
    }
  }, [token]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  async function fetchRecommendations() {
    setRecommendationsLoading(true);
    setError(null);
    try {
      const res = await api.recommendations.get({
        query: form.accompanimentReason,
      });
      const list = (res.psychologists ?? []).map((p) =>
        normalizeRecommendedPsychologist(p as ApiRecommendedPsychologist),
      );
      setPsychologists(list);

      if (
        initialPsychologistId &&
        list.some((p) => p.id === initialPsychologistId)
      ) {
        const match = list.find((p) => p.id === initialPsychologistId);
        if (match) {
          setScheduleModalPsychologist(match);
        }
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No pudimos cargar recomendaciones",
      );
    } finally {
      setRecommendationsLoading(false);
    }
  }

  async function handleToggleFavorite(psychologistId: string) {
    setFavoriteLoadingId(psychologistId);
    setError(null);
    try {
      if (favoriteIds.has(psychologistId)) {
        await api.favorites.remove(token, psychologistId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(psychologistId);
          return next;
        });
      } else {
        await api.favorites.add(token, psychologistId);
        setFavoriteIds((prev) => new Set(prev).add(psychologistId));
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No pudimos actualizar favorito",
      );
    } finally {
      setFavoriteLoadingId(null);
    }
  }

  function validateStep1(): boolean {
    if (!form.accompanimentReason) {
      setError("Selecciona un motivo de acompañamiento.");
      return false;
    }
    if (!form.modality) {
      setError("Selecciona una modalidad.");
      return false;
    }
    return true;
  }

  async function goToStep2() {
    if (!validateStep1()) return;
    setError(null);
    setStep(2);
    await fetchRecommendations();
  }

  function handleScheduleConfirm(
    psychologist: RecommendedPsychologist,
    slot: AvailabilitySlot,
  ) {
    setSelectedPsychologistId(psychologist.id);
    setSelectedSlot(slot);
    setScheduleModalPsychologist(null);
    setError(null);
    setStep(3);
  }

  async function handleConfirm() {
    if (!selectedPsychologistId || !selectedSlot || !form.modality) return;
    if (new Date(selectedSlot.startAt).getTime() <= Date.now()) {
      setError(
        "El horario seleccionado ya pasó. Vuelve atrás y elige otro.",
      );
      return;
    }
    if (!privacyChoice) {
      setError("Indica tu preferencia de privacidad.");
      return;
    }
    if (!acceptedPolicies) {
      setError("Debes aceptar las políticas.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.appointments.create(token, {
        psychologistId: selectedPsychologistId,
        slotId: selectedSlot.id,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        modality: form.modality,
        notes: buildAppointmentNotes({
          accompanimentReason: form.accompanimentReason,
          accompanimentLabel: accompanimentReasonLabel(form.accompanimentReason),
          description: form.description,
          emotionalState: form.emotionalState || undefined,
          privacyChoice: privacyChoice ?? undefined,
        }),
      });
      setConfirmed(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No pudimos confirmar la cita",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed && selectedPsychologist && selectedSlot) {
    return (
      <Card className="max-w-2xl border-mu-border">
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-mu-success"
            aria-hidden
          />
          <div>
            <h2 className="font-heading text-lg font-semibold">
              Cita confirmada
            </h2>
            <p className="mt-1 text-sm text-mu-text-muted">
              Recibirás un recordatorio antes de tu sesión.
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-mu-text-muted">Profesional</dt>
                <dd className="font-medium">
                  {selectedPsychologist.name ?? "Profesional"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mu-text-muted">Fecha</dt>
                <dd className="font-medium">
                  {formatAppointmentDate(selectedSlot.startAt)}
                </dd>
              </div>
            </dl>
            <Button
              className="mt-6"
              variant="outline"
              href="/app/paciente/citas"
            >
              Ver mis citas
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl">
      <BookSessionSteps currentStep={step} />

      {error ? (
        <p
          className="mb-6 rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {scheduleModalPsychologist ? (
        <ScheduleModal
          open
          psychologist={scheduleModalPsychologist}
          onClose={() => setScheduleModalPsychologist(null)}
          onConfirm={(slot) =>
            handleScheduleConfirm(scheduleModalPsychologist, slot)
          }
        />
      ) : null}

      {step === 1 ? (
        <div className="space-y-0">
          <FormSection title="Motivo de acompañamiento">
            <label htmlFor="accompaniment-reason" className="sr-only">
              Motivo de acompañamiento
            </label>
            <select
              id="accompaniment-reason"
              value={form.accompanimentReason}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  accompanimentReason: e.target.value,
                }))
              }
              required
              className="h-11 w-full rounded-mu border border-mu-border px-3 text-sm focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary"
            >
              <option value="">Selecciona un motivo…</option>
              {ACCOMPANIMENT_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormSection>

          <FormSection title="Descripción" optional>
            <FormTextarea
              label="Cuéntanos un poco más"
              hint="Opcional"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              placeholder="Cuéntanos un poco más (opcional)"
            />
          </FormSection>

          <FormSection title="Modalidad">
            <div className="flex flex-wrap gap-4">
              {(
                [
                  { value: "ONLINE" as const, label: "Virtual" },
                  { value: "IN_PERSON" as const, label: "Presencial" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="radio"
                    name="modality"
                    checked={form.modality === opt.value}
                    onChange={() =>
                      setForm((prev) => ({ ...prev, modality: opt.value }))
                    }
                    className="accent-mu-primary"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </FormSection>

          <FormSection title="Estado emocional" optional className="border-b-0">
            <select
              value={form.emotionalState}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  emotionalState: e.target.value as EmotionalState | "",
                }))
              }
              className="h-11 w-full rounded-mu border border-mu-border px-3 text-sm focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary"
            >
              <option value="">Seleccionar…</option>
              {EMOTIONAL_STATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormSection>

          <div className="mt-8 flex justify-end">
            <Button type="button" onClick={goToStep2}>
              Continuar
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Especialistas recomendados
          </h2>
          <p className="mt-1 text-sm text-mu-text-muted">
            Elige un profesional y selecciona fecha y hora en el calendario.
          </p>

          {recommendationsLoading ? (
            <p className="mt-6 flex items-center gap-2 text-sm text-mu-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Cargando recomendaciones…
            </p>
          ) : psychologists.length === 0 ? (
            <Card className="mt-6">
              <p className="text-sm text-mu-text-muted">
                No hay profesionales recomendados para tu búsqueda.
              </p>
            </Card>
          ) : (
            <ul className="mt-6 space-y-3">
              {psychologists.map((p) => (
                <li key={p.id}>
                  <RecommendedPsychologistCard
                    psychologist={p}
                    selected={selectedPsychologistId === p.id}
                    scheduledAt={
                      selectedPsychologistId === p.id
                        ? selectedSlot?.startAt
                        : null
                    }
                    isFavorite={favoriteIds.has(p.id)}
                    favoriteLoading={favoriteLoadingId === p.id}
                    onSchedule={() => setScheduleModalPsychologist(p)}
                    onToggleFavorite={() => handleToggleFavorite(p.id)}
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Atrás
            </Button>
            {selectedPsychologistId && selectedSlot ? (
              <Button type="button" onClick={() => setStep(3)}>
                Continuar a confirmación
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 3 && selectedPsychologist && selectedSlot ? (
        <div>
          <h2 className="font-heading text-lg font-semibold">Confirmación</h2>
          <p className="mt-1 text-sm text-mu-text-muted">
            Revisa los detalles antes de confirmar.
          </p>

          <Card className="mt-6">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-mu-text-muted">Motivo</dt>
                <dd className="text-right font-medium">
                  {accompanimentReasonLabel(form.accompanimentReason)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mu-text-muted">Profesional</dt>
                <dd className="text-right font-medium">
                  {selectedPsychologist.name ?? "Profesional"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mu-text-muted">Modalidad</dt>
                <dd>
                  {form.modality === "ONLINE" ? "Virtual" : "Presencial"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mu-text-muted">Fecha</dt>
                <dd className="font-medium">
                  {formatAppointmentDate(selectedSlot.startAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mu-text-muted">Hora</dt>
                <dd className="font-medium">
                  {new Intl.DateTimeFormat("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(selectedSlot.startAt))}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mu-text-muted">Alias</dt>
                <dd>{alias ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mu-text-muted">Precio</dt>
                <dd className="font-medium text-mu-primary">
                  {formatCOP(
                    selectedPsychologist.priceCents,
                    selectedPsychologist.currency,
                  )}
                </dd>
              </div>
            </dl>
          </Card>

          <FormSection title="Privacidad" className="mt-8 border-b-0 pb-0">
            <div className="space-y-2">
              {(
                [
                  { value: "YES" as PrivacyChoice, label: "Sí, usar alias" },
                  { value: "NO" as PrivacyChoice, label: "No" },
                  {
                    value: "DISCUSS" as PrivacyChoice,
                    label: "Hablar con el profesional",
                  },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-mu border p-3 text-sm",
                    privacyChoice === opt.value
                      ? "border-mu-primary bg-mu-accent/30"
                      : "border-mu-border",
                  )}
                >
                  <input
                    type="radio"
                    name="privacy"
                    checked={privacyChoice === opt.value}
                    onChange={() => setPrivacyChoice(opt.value)}
                    className="accent-mu-primary"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </FormSection>

          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={acceptedPolicies}
              onChange={(e) => setAcceptedPolicies(e.target.checked)}
              className="mt-0.5 accent-mu-primary"
            />
            <span className="text-mu-text-muted">
              Acepto las políticas de privacidad y términos de uso.
            </span>
          </label>

          <div className="mt-8 flex justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              Atrás
            </Button>
            <Button
              type="button"
              loading={submitting}
              onClick={handleConfirm}
            >
              Confirmar cita
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
