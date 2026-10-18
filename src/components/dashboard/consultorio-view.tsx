"use client";

import { AppointmentSessionChatWidget } from "@/components/chat/appointment-session-chat-widget";
import {
  ConsultorioVideoPanel,
  type ConsultorioVideoHandle,
} from "@/components/consultorio/consultorio-video-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api-client";
import type { AppointmentItem, PatientClinicalProfile } from "@/lib/api/types";
import { useAuthStore } from "@/lib/auth/store";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SessionNotesForm = {
  observations: string;
  impression: string;
  plan: string;
  riskNotes: string;
};

const EMPTY_NOTES: SessionNotesForm = {
  observations: "",
  impression: "",
  plan: "",
  riskNotes: "",
};

function parseNotes(body: string | null | undefined): SessionNotesForm {
  if (!body?.trim()) return { ...EMPTY_NOTES };
  try {
    const parsed = JSON.parse(body) as Partial<SessionNotesForm>;
    if (
      parsed &&
      typeof parsed === "object" &&
      ("observations" in parsed ||
        "impression" in parsed ||
        "plan" in parsed ||
        "riskNotes" in parsed)
    ) {
      return {
        observations: parsed.observations ?? "",
        impression: parsed.impression ?? "",
        plan: parsed.plan ?? "",
        riskNotes: parsed.riskNotes ?? "",
      };
    }
  } catch {
    // Texto libre previo → va a observaciones
  }
  return { ...EMPTY_NOTES, observations: body };
}

function serializeNotes(form: SessionNotesForm): string {
  return JSON.stringify(form);
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <p className="text-sm">
      <span className="font-medium text-mu-text">{label}:</span>{" "}
      <span className="text-mu-text-muted">{value?.trim() || "No registrado"}</span>
    </p>
  );
}

export function ConsultorioView({ appointmentId }: { appointmentId: string }) {
  const token = useAuthStore((s) => s.token)!;
  const router = useRouter();
  const videoRef = useRef<ConsultorioVideoHandle>(null);
  const [appointment, setAppointment] = useState<AppointmentItem | null>(null);
  const [clinical, setClinical] = useState<PatientClinicalProfile | null>(null);
  const [notes, setNotes] = useState<SessionNotesForm>(EMPTY_NOTES);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const appt = await api.appointments.getById(token, appointmentId);
        setAppointment(appt);
        const [profile, note] = await Promise.all([
          appt.patient
            ? api.psychologists.patientClinical(token, appt.patient.id)
            : Promise.resolve(null),
          api.clinicalNotes.get(token, appointmentId),
        ]);
        setClinical(profile);
        setNotes(parseNotes(note?.body));
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

  async function saveNotes() {
    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      await api.clinicalNotes.put(
        token,
        appointmentId,
        serializeNotes(notes),
      );
      setFeedback("Notas clínicas guardadas.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudieron guardar las notas",
      );
    } finally {
      setSaving(false);
    }
  }

  async function completeSession() {
    setCompleting(true);
    setError(null);
    try {
      await videoRef.current?.disconnect();
      await api.clinicalNotes.put(
        token,
        appointmentId,
        serializeNotes(notes),
      );
      await api.appointments.complete(token, appointmentId);
      setCompleteOpen(false);
      router.push("/app/psicologo/agenda");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo cerrar la sesión",
      );
    } finally {
      setCompleting(false);
    }
  }

  function updateNote<K extends keyof SessionNotesForm>(
    key: K,
    value: SessionNotesForm[K],
  ) {
    setNotes((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <DashboardShell
      role="psychologist"
      contained
      mainClassName="flex flex-col overflow-hidden"
    >
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Consultorio</h1>
          <p className="mt-1 text-sm text-mu-text-muted">
            {appointment?.patient?.alias ?? "Cargando paciente…"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" href="/app/psicologo/agenda">
            Volver a agenda
          </Button>
          <Button type="button" onClick={() => setCompleteOpen(true)}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      {error ? (
        <p className="mt-3 shrink-0 text-sm text-mu-error" role="alert">
          {error}
        </p>
      ) : null}
      {feedback ? (
        <p className="mt-3 shrink-0 text-sm text-mu-success" role="status">
          {feedback}
        </p>
      ) : null}

      <div className="relative mt-4 grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]">
        <Card className="flex min-h-64 flex-col overflow-hidden p-0 xl:min-h-0">
          <ConsultorioVideoPanel
            ref={videoRef}
            appointmentId={appointmentId}
            className="min-h-0 flex-1"
          />
        </Card>

        <Card className="flex min-h-0 flex-col overflow-hidden p-0">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
            <section>
              <h2 className="font-heading text-lg font-semibold text-mu-text">
                Datos del paciente
              </h2>
              <p className="mt-0.5 text-xs text-mu-text-muted">
                Información reportada por el paciente (solo lectura)
              </p>
              <div className="mt-3 grid gap-2">
                <Field
                  label="Ciudad"
                  value={
                    clinical?.city
                      ? `${clinical.city}${clinical.department ? `, ${clinical.department}` : ""}`
                      : null
                  }
                />
                <Field
                  label="Motivo de consulta"
                  value={clinical?.consultationReason}
                />
                <Field label="Cómo se siente" value={clinical?.wellbeingFeeling} />
                <Field label="Enfoque de trabajo" value={clinical?.workOnFocus} />
                <Field
                  label="Antecedentes psicológicos"
                  value={clinical?.psychologicalHistory}
                />
                <Field
                  label="Antecedentes psiquiátricos"
                  value={clinical?.psychiatricHistory}
                />
                <Field label="Medicamentos" value={clinical?.currentMedication} />
                <Field
                  label="Riesgo reportado"
                  value={clinical?.selfReportedRiskLevel}
                />
                {clinical?.clinicalTags?.length ? (
                  <p className="text-sm">
                    <span className="font-medium text-mu-text">Etiquetas:</span>{" "}
                    <span className="text-mu-text-muted">
                      {clinical.clinicalTags.join(", ")}
                    </span>
                  </p>
                ) : null}
              </div>
            </section>

            <section className="border-t border-mu-border pt-5">
              <h2 className="font-heading text-lg font-semibold text-mu-text">
                Registro de la sesión
              </h2>
              <p className="mt-0.5 text-xs text-mu-text-muted">
                Completa estos campos durante o al cierre de la consulta
              </p>

              <div className="mt-4 space-y-4">
                <label className="block text-sm font-medium text-mu-text">
                  Observaciones de la sesión
                  <textarea
                    value={notes.observations}
                    onChange={(e) => updateNote("observations", e.target.value)}
                    rows={4}
                    className="mt-1.5 w-full rounded-mu border border-mu-border px-3 py-2 text-sm text-mu-text focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary"
                    placeholder="Qué observaste en la sesión, temas tratados, afecto…"
                  />
                </label>

                <label className="block text-sm font-medium text-mu-text">
                  Impresión clínica
                  <textarea
                    value={notes.impression}
                    onChange={(e) => updateNote("impression", e.target.value)}
                    rows={3}
                    className="mt-1.5 w-full rounded-mu border border-mu-border px-3 py-2 text-sm text-mu-text focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary"
                    placeholder="Hipótesis, focos terapéuticos, avances…"
                  />
                </label>

                <label className="block text-sm font-medium text-mu-text">
                  Plan / acuerdos
                  <textarea
                    value={notes.plan}
                    onChange={(e) => updateNote("plan", e.target.value)}
                    rows={3}
                    className="mt-1.5 w-full rounded-mu border border-mu-border px-3 py-2 text-sm text-mu-text focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary"
                    placeholder="Tareas, frecuencia de seguimiento, próximos pasos…"
                  />
                </label>

                <label className="block text-sm font-medium text-mu-text">
                  Notas de riesgo (sesión)
                  <textarea
                    value={notes.riskNotes}
                    onChange={(e) => updateNote("riskNotes", e.target.value)}
                    rows={2}
                    className="mt-1.5 w-full rounded-mu border border-mu-border px-3 py-2 text-sm text-mu-text focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary"
                    placeholder="Si aplica: ideación, factores protectores, acciones tomadas…"
                  />
                </label>
              </div>

              <Button
                className="mt-4"
                variant="outline"
                type="button"
                onClick={() => void saveNotes()}
                disabled={saving}
              >
                {saving ? "Guardando…" : "Guardar notas"}
              </Button>
            </section>
          </div>
        </Card>

        <AppointmentSessionChatWidget
          appointmentId={appointmentId}
          ownSender="PSYCHOLOGIST"
          peerLabel={appointment?.patient?.alias ?? "Paciente"}
        />
      </div>

      <AppModal
        open={completeOpen}
        title="Cerrar sesión"
        description="Se guardarán las notas clínicas y la cita quedará como completada. Si cancelas, la sesión sigue abierta."
        onClose={() => {
          if (!completing) setCompleteOpen(false);
        }}
        primaryAction={{
          label: "Confirmar cierre",
          loading: completing,
          onClick: () => {
            void completeSession();
          },
        }}
        secondaryAction={{ label: "Volver" }}
      />
    </DashboardShell>
  );
}
