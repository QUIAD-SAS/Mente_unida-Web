import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { Icon } from "../../components/Icon";
import { PortalShell } from "../../components/PortalShell";
import { fieldClass } from "../../components/ui";
import { clockLabel, formatLongDate, psychById, sessionPhase, sessionPhaseText, todayIso, useClinic } from "../../portal/clinic";

export function EscuchaderoPage({ role }: { role: "patient" | "psychologist" }) {
  const clinic = useClinic();
  const partner =
    role === "patient"
      ? psychById(clinic.patient.assignment?.psychologistId ?? clinic.visiblePsychologists(clinic.patient)[0]?.id ?? "laura")
      : null;
  const [draft, setDraft] = useState("");
  const home = role === "patient" ? "/paciente" : "/psicologo";

  return (
    <PortalShell
      role={role}
      person={role === "patient" ? clinic.patient.name : clinic.psychologist.name}
      detail={role === "patient" ? "Paciente activo" : "Portal clínico"}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl font-semibold text-primary">
            <Icon name="chat" className="text-[28px]" />
            El Escuchadero
          </h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            {role === "patient"
              ? "Espacio para iniciar una conversación con un psicólogo antes de que llegue la cita."
              : "Espacio para escuchar a tus pacientes antes de que llegue la cita."}
          </p>
        </div>
        <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">En atención</span>
      </div>
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section className="flex min-h-[28rem] min-w-0 flex-col rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 border-b border-surface-high pb-4">
            {partner ? <img src={partner.image} alt="" className="h-12 w-12 rounded-full object-cover" /> : <Icon name="chat" className="text-[28px] text-primary" />}
            <div>
              <p className="font-display font-semibold">{role === "patient" ? partner?.name : "Conversaciones de tus pacientes"}</p>
              <p className="text-sm text-ink-soft">{role === "patient" ? "Te escucha antes de la sesión" : clinic.psychologist.name}</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 py-4">
            {clinic.messages.map((message) => {
              const mine = role === "patient" ? message.from === "patient" : message.from === "psychologist";
              return (
                <div key={message.id} className={`max-w-[36rem] rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? "ml-auto bg-primary-container text-white" : "bg-surface-low text-ink"}`}>
                  <p>{message.text}</p>
                  <p className={`mt-1 text-xs ${mine ? "text-primary-fixed" : "text-ink-soft"}`}>{message.time}</p>
                </div>
              );
            })}
          </div>
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const text = draft.trim();
              if (!text) return;
              clinic.sendMessage(role === "patient" ? "patient" : "psychologist", text);
              setDraft("");
            }}
          >
            <label className="sr-only" htmlFor="escuchadero-mensaje">
              Mensaje
            </label>
            <input
              id="escuchadero-mensaje"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={role === "patient" ? "Escribe aquí lo que sientes con calma..." : "Escribe tu respuesta con calma..."}
              className="min-w-0 flex-1 rounded-xl bg-surface-low px-4 py-3 text-base outline-none"
            />
            <button type="submit" aria-label="Enviar mensaje" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container text-white">
              <Icon name="send" className="text-[20px]" />
            </button>
          </form>
        </section>
        <aside className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="font-display font-semibold text-primary">Antes de la cita</p>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            {role === "patient"
              ? "Este chat no reemplaza la sesión. Sirve para que alguien te escuche mientras llega el horario del calendario."
              : "Este chat no reemplaza la sesión. Sirve para acompañar a la persona mientras llega el horario del calendario."}
          </p>
          <Link to={home} className="mt-4 inline-flex text-sm font-semibold text-primary">
            Volver al inicio
          </Link>
        </aside>
      </div>
    </PortalShell>
  );
}

export function VideoRoomPage({ role }: { role: "patient" | "psychologist" }) {
  if (role === "psychologist") return <PsychSessionRoom />;
  return <PatientVideoRoom />;
}

function PsychSessionRoom() {
  const { user } = useAuth();
  const clinic = useClinic();
  const [params] = useSearchParams();
  const requested = params.get("cita");
  const visit =
    clinic.appointments.find((item) => item.id === requested && item.psychologistId === clinic.currentPsychId) ??
    clinic.appointments.find((item) => item.id === "sesion-hoy-2035") ??
    clinic.appointments.find((item) => item.psychologistId === clinic.currentPsychId && item.date === todayIso() && item.mode === "virtual");
  const person = clinic.patients.find((item) => item.id === visit?.patientId);
  const phase = visit ? sessionPhase(visit.date, visit.time) : "antes";
  const [muted, setMuted] = useState(false);
  const [camera, setCamera] = useState(true);
  const [inCall, setInCall] = useState(true);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState({
    observations: "",
    evolution: "",
    interventions: "",
    recommendations: "",
    nextObjectives: "",
    riskNotes: "",
  });

  return (
    <PortalShell fillViewport role="psychologist" person={user?.name ?? clinic.psychologist.name} detail="Sesión en curso">
      <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{visit ? sessionPhaseText(phase, visit.time) : "No hay una sesión virtual para abrir."}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">Sesión con {person?.name ?? "el paciente"}</h1>
          {visit ? <p className="mt-1 text-sm text-ink-soft">{formatLongDate(visit.date)} · {clockLabel(visit.time)} · Virtual</p> : null}
        </div>
        <Link to="/psicologo/agenda" className="inline-flex justify-center rounded-xl bg-secondary px-4 py-3 font-display text-sm font-semibold text-white">
          Salir de la sala
        </Link>
      </div>
      <section className="mb-3 shrink-0 overflow-hidden rounded-3xl bg-forest">
        {inCall ? (
          <div className="relative">
            <img src="/images/hero-session.png" alt={`Conferencia con ${person?.name ?? "el paciente"}`} className="h-[clamp(9rem,28dvh,16rem)] w-full object-cover" />
            {camera ? null : (
              <div className="absolute inset-0 grid place-items-center bg-ink/75 px-6 text-center text-white">
                <p className="font-display text-xl font-semibold">Cámara apagada</p>
              </div>
            )}
            <p className="absolute top-3 left-3 rounded-full bg-ink/55 px-3 py-1 text-xs font-semibold text-white">Conferencia en curso</p>
            <div className="absolute right-3 bottom-3 w-28 overflow-hidden rounded-xl border border-white/40 sm:w-36">
              <div className="flex h-16 items-end bg-primary-container/85 p-2 sm:h-20">
                <span className="text-xs font-semibold text-white">{user?.name ?? clinic.psychologist.name}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-[clamp(9rem,28dvh,16rem)] flex-col items-center justify-center gap-3 px-6 text-center text-white">
            <p className="font-display text-2xl font-semibold">Saliste de la conferencia</p>
            <p className="max-w-md text-sm leading-6 text-primary-fixed">El historial, el RIPS y la nota de esta sesión siguen abiertos debajo.</p>
            <button type="button" onClick={() => setInCall(true)} className="rounded-xl bg-white px-4 py-3 font-display text-sm font-semibold text-primary">
              Volver a la conferencia
            </button>
          </div>
        )}
      </section>
      {inCall ? (
        <div className="mb-3 flex shrink-0 flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button type="button" aria-pressed={muted} onClick={() => setMuted((value) => !value)} className="rounded-xl bg-surface-mid px-4 py-3 font-display text-sm font-semibold">
              <Icon name={muted ? "mic_off" : "mic"} className="text-[20px]" />
              <span className="sr-only">{muted ? "Activar micrófono" : "Silenciar"}</span>
            </button>
            <button type="button" aria-pressed={!camera} onClick={() => setCamera((value) => !value)} className="rounded-xl bg-surface-mid px-4 py-3 font-display text-sm font-semibold">
              <Icon name={camera ? "videocam" : "videocam_off"} className="text-[20px]" />
              <span className="sr-only">{camera ? "Apagar cámara" : "Encender cámara"}</span>
            </button>
          </div>
          <button type="button" onClick={() => setInCall(false)} className="rounded-xl bg-secondary px-4 py-3 font-display text-sm font-semibold text-white">
            Salir de la conferencia
          </button>
        </div>
      ) : null}
      <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto overscroll-contain pb-2 lg:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-semibold">Historial clínico</h2>
            <dl className="mt-4 grid gap-3">
              <NoteFact label="Motivo de consulta" value="Ansiedad con preocupación anticipatoria y sueño entrecortado." />
              <NoteFact label="Antecedentes" value="Los episodios empezaron hace cerca de seis meses, sobre todo entre semana." />
              <NoteFact label="Evaluación inicial" value="Ansiedad moderada. Mantiene sus actividades, con fatiga al final del día." />
              <NoteFact label="Objetivos" value="Regular el sueño y bajar la preocupación antes de las citas del día siguiente." />
            </dl>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-semibold">RIPS</h2>
            <article className="mt-4 rounded-xl bg-surface-low p-4">
              <p className="font-display font-semibold">29 de octubre de 2026 · 4:00 p. m.</p>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <NoteFact label="Prestación" value="Consulta de psicología" />
                <NoteFact label="Modalidad" value="Virtual" />
                <NoteFact label="Motivo" value="Ansiedad" />
                <NoteFact label="Evolución" value="Durmió tres noches seguidas. La preocupación baja cuando nombra la tarea del día siguiente." />
                <NoteFact label="Diagnóstico CIE-10" value="No registrado" />
              </dl>
            </article>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-semibold">Notas anteriores</h2>
            <article className="mt-4 rounded-xl bg-surface-low p-4">
              <p className="font-display font-semibold">29 de octubre de 2026 · 4:00 p. m.</p>
              <dl className="mt-3 grid gap-3">
                <NoteFact label="Observaciones" value="Llega en hora. Refiere noches de 4 horas y revisión repetida del calendario laboral." />
                <NoteFact label="Evolución" value="Identifica el momento en que la preocupación sube: al cerrar el computador." />
                <NoteFact label="Intervenciones" value="Respiración de cuatro tiempos y una lista de cierre con tres pendientes, no más." />
                <NoteFact label="Recomendaciones" value="Probar la lista de cierre de lunes a jueves." />
                <NoteFact label="Próximos objetivos" value="Revisar si el sueño se sostuvo esta semana." />
                <NoteFact label="Notas de riesgo" value="Sin señales de riesgo agudo." />
              </dl>
            </article>
          </section>
        </div>
        <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold">Notas de esta sesión</h2>
          <p className="mt-1 text-sm text-ink-soft">{visit ? `${formatLongDate(visit.date)} · ${clockLabel(visit.time)}` : "Sesión de hoy"}</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              setSaved(true);
            }}
          >
            <NoteField label="Observaciones" value={note.observations} onChange={(value) => setNote((current) => ({ ...current, observations: value }))} />
            <NoteField label="Evolución" value={note.evolution} onChange={(value) => setNote((current) => ({ ...current, evolution: value }))} />
            <NoteField label="Intervenciones" value={note.interventions} onChange={(value) => setNote((current) => ({ ...current, interventions: value }))} />
            <NoteField label="Recomendaciones" value={note.recommendations} onChange={(value) => setNote((current) => ({ ...current, recommendations: value }))} />
            <NoteField label="Próximos objetivos" value={note.nextObjectives} onChange={(value) => setNote((current) => ({ ...current, nextObjectives: value }))} />
            <NoteField label="Notas de riesgo" value={note.riskNotes} onChange={(value) => setNote((current) => ({ ...current, riskNotes: value }))} />
            <button type="submit" className="w-full rounded-xl bg-primary-container px-4 py-3 font-display text-sm font-semibold text-white">
              Guardar nota de la sesión
            </button>
            {saved ? <p className="text-sm font-semibold text-primary">La nota de las {visit ? clockLabel(visit.time) : "8:35 p. m."} quedó registrada en esta sesión.</p> : null}
          </form>
        </section>
      </div>
      </div>
    </PortalShell>
  );
}

function NoteFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{label}</dt>
      <dd className="mt-1 text-sm leading-6 break-words">{value}</dd>
    </div>
  );
}

function NoteField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} mt-1 min-h-20`} />
    </label>
  );
}

function PatientVideoRoom() {
  const clinic = useClinic();
  const [muted, setMuted] = useState(false);
  const [camera, setCamera] = useState(true);
  const [left, setLeft] = useState(false);
  const remote = psychById(clinic.patient.assignment?.psychologistId ?? "carlos");
  const title = `Sesión con ${remote.name}`;

  return (
    <PortalShell role="patient" person={clinic.patient.name} detail="Paciente activo">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        <span className="w-fit rounded-full bg-surface-mid px-3 py-1 text-sm text-ink-soft">Conexión de la sala</span>
      </div>
      <div className="overflow-hidden rounded-3xl bg-forest">
        {left ? (
          <div className="flex min-h-[22rem] flex-col items-center justify-center gap-4 px-6 text-center text-white">
            <p className="font-display text-2xl font-semibold">Saliste de la sala</p>
            <Link to="/paciente/citas" className="rounded-xl bg-white px-4 py-3 font-display text-sm font-semibold text-primary">
              Volver al calendario
            </Link>
          </div>
        ) : (
          <div className="relative min-h-[22rem] sm:min-h-[28rem]">
            <img
              src={remote?.image ?? "/images/hero-session.png"}
              alt="Psicólogo en la sesión virtual"
              className="h-[22rem] w-full object-cover sm:h-[28rem]"
            />
            <div className="absolute right-3 bottom-3 w-28 overflow-hidden rounded-xl border border-white/40 bg-ink/40 sm:w-36">
              <div className="flex h-20 items-end bg-primary-container/80 p-2 sm:h-24">
                <span className="text-xs font-semibold text-white">{clinic.patient.name}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {left ? null : (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button type="button" aria-pressed={muted} onClick={() => setMuted((value) => !value)} className="rounded-xl bg-surface-mid px-4 py-3 font-display text-sm font-semibold">
              <Icon name={muted ? "mic_off" : "mic"} className="text-[20px]" />
              <span className="sr-only">{muted ? "Activar micrófono" : "Silenciar"}</span>
            </button>
            <button type="button" aria-pressed={!camera} onClick={() => setCamera((value) => !value)} className="rounded-xl bg-surface-mid px-4 py-3 font-display text-sm font-semibold">
              <Icon name={camera ? "videocam" : "videocam_off"} className="text-[20px]" />
              <span className="sr-only">{camera ? "Apagar cámara" : "Encender cámara"}</span>
            </button>
          </div>
          <button type="button" onClick={() => setLeft(true)} className="rounded-xl bg-secondary px-4 py-3 font-display text-sm font-semibold text-white">
            Salir de la sala
          </button>
        </div>
      )}
    </PortalShell>
  );
}
