import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchClinicalNotes, fetchClinicalRecord, type ClinicalNote, type ClinicalRecord } from "../../api/clinical";
import { apiErrorMessage } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Icon } from "../../components/Icon";
import { PortalShell } from "../../components/PortalShell";

function when(value: string) {
  return new Date(value).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function text(value: string | null | undefined) {
  const clean = value?.trim();
  return clean ? clean : "Sin registro";
}

export function PatientChartPage() {
  const { patientId = "" } = useParams();
  const [search] = useSearchParams();
  const { user } = useAuth();
  const name = search.get("nombre") || "Paciente";
  const alias = search.get("alias") || "";
  const [record, setRecord] = useState<ClinicalRecord | null>(null);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([fetchClinicalRecord(patientId), fetchClinicalNotes(patientId)])
      .then(([nextRecord, nextNotes]) => {
        if (cancelled) return;
        setRecord(nextRecord);
        setNotes(nextNotes.items);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(apiErrorMessage(caught, "No pudimos abrir la ficha de este paciente."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const notesByAppointment = new Map(notes.map((note) => [note.appointmentId, note]));

  return (
    <PortalShell role="psychologist" person={user?.name ?? "Portal clínico"} detail="Ficha del paciente">
      <Link to="/psicologo/pacientes" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
        <Icon name="arrow_back" className="text-[18px]" />
        Volver a pacientes
      </Link>
      <div className="mt-4">
        <p className="text-sm text-ink-soft">Expediente clínico {alias ? `· ${alias}` : ""}</p>
        <h1 className="font-display text-3xl font-semibold text-primary">{name}</h1>
      </div>

      {loading ? <p className="mt-6 text-sm text-ink-soft">Abriendo la historia, las notas y el RIPS…</p> : null}
      {error ? <p className="mt-6 rounded-xl bg-secondary/10 px-4 py-3 text-sm text-secondary">{error}</p> : null}

      {record ? (
        <div className="mt-6 space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-semibold">Historia clínica</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {record.status === "OPEN" ? "Abierta" : record.status} · desde {when(record.openedAt)} · {record.professional.name}
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Fact label="Motivo de consulta" value={text(record.consultationReason)} />
              <Fact label="Antecedentes" value={text(record.antecedents)} />
              <Fact label="Evaluación inicial" value={text(record.initialEvaluation)} />
              <Fact label="Objetivos terapéuticos" value={text(record.therapeuticGoals)} />
            </dl>
          </section>

          <Disclosure title="Notas clínicas" summary={notes.length === 0 ? "Sin notas en esta historia" : `${notes.length} ${notes.length === 1 ? "nota" : "notas"}`}>
            {notes.length === 0 ? <p className="text-sm text-ink-soft">Esta historia todavía no tiene notas.</p> : null}
            <div className="space-y-3">
              {notes.map((note) => (
                <article key={note.id} className="rounded-xl bg-surface-low p-4">
                  <p className="font-display font-semibold">{when(note.attendedAt)}</p>
                  <dl className="mt-3 grid gap-3">
                    <Fact label="Observaciones" value={text(note.observations)} />
                    <Fact label="Evolución" value={text(note.evolution)} />
                    <Fact label="Intervenciones" value={text(note.interventions)} />
                    <Fact label="Recomendaciones" value={text(note.recommendations)} />
                    <Fact label="Próximos objetivos" value={text(note.nextObjectives)} />
                    <Fact label="Notas de riesgo" value={text(note.riskNotes)} />
                  </dl>
                </article>
              ))}
            </div>
          </Disclosure>

          <Disclosure title="RIPS" summary={record.appointments.length === 0 ? "Sin prestaciones registradas" : `${record.appointments.length} ${record.appointments.length === 1 ? "prestación" : "prestaciones"}`}>
            <p className="text-sm text-ink-soft">Registro de cada prestación. El documento de identidad y el diagnóstico CIE-10 se muestran cuando la historia los trae.</p>
            {record.appointments.length === 0 ? <p className="mt-3 text-sm text-ink-soft">No hay atenciones para armar el RIPS.</p> : null}
            <div className="mt-4 space-y-3">
              {record.appointments.map((visit) => {
                const note = notesByAppointment.get(visit.id);
                return (
                  <article key={visit.id} className="rounded-xl bg-surface-low p-4">
                    <p className="font-display font-semibold">{when(visit.startAt)}</p>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Fact label="Tipo de prestación" value="Consulta de psicología" />
                      <Fact label="Estado de la atención" value={visit.status} />
                      <Fact label="Motivo" value={text(record.consultationReason)} />
                      <Fact label="Evolución" value={text(note?.evolution)} />
                      <Fact label="Plan" value={text(note?.recommendations ?? note?.nextObjectives)} />
                      <Fact label="Identificación" value="No viene en el registro" />
                      <Fact label="Diagnóstico CIE-10" value="No registrado" />
                    </dl>
                  </article>
                );
              })}
            </div>
          </Disclosure>
        </div>
      ) : null}
    </PortalShell>
  );
}

function Disclosure({ title, summary, children }: { title: string; summary: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
        <span className="min-w-0">
          <span className="block font-display text-lg font-semibold">{title}</span>
          <span className="mt-1 block text-sm text-ink-soft">{summary}</span>
        </span>
        <Icon name={open ? "expand_less" : "expand_more"} className="text-[24px] text-primary" />
      </button>
      {open ? <div className="border-t border-surface-high px-5 py-4">{children}</div> : null}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{label}</dt>
      <dd className="mt-1 text-sm leading-6 break-words">{value}</dd>
    </div>
  );
}
