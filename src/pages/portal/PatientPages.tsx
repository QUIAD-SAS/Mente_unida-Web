import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { fetchMyCompletion, fetchMyPatient, resendVerification } from "../../api/auth";
import { apiErrorMessage } from "../../api/client";
import type { PatientProfile, ProfileCompletion } from "../../api/types";
import { useAuth } from "../../auth/AuthProvider";
import { Icon } from "../../components/Icon";
import { PortalShell } from "../../components/PortalShell";
import { fieldClass } from "../../components/ui";
import { MonthCalendar } from "../../portal/Calendar";
import { formatLongDate, psychById, todayIso, useClinic, type Mode, type PsychId } from "../../portal/clinic";

function AccountConnection() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchMyPatient(), fetchMyCompletion()])
      .then(([nextProfile, nextCompletion]) => {
        if (cancelled) return;
        setProfile(nextProfile);
        setCompletion(nextCompletion);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(apiErrorMessage(caught, "No pudimos leer tu perfil."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return null;

  return (
    <article className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <p className="font-display text-sm font-semibold text-primary">Cuenta conectada</p>
      <h2 className="mt-2 font-display text-xl font-semibold">{profile?.name ?? user.name}</h2>
      <p className="mt-1 text-sm text-ink-soft">{user.email}</p>
      {profile ? <p className="mt-1 text-sm text-ink-soft">Identidad en el perfil: {profile.alias}</p> : null}
      {completion && !completion.complete ? (
        <p className="mt-3 text-sm leading-6 text-ink-soft">Para completar tu ficha falta: {completion.missing.join(", ")}.</p>
      ) : null}
      {completion?.complete ? <p className="mt-3 text-sm text-primary">Tu ficha personal está completa.</p> : null}
      {user.emailVerified ? (
        <p className="mt-3 text-sm text-primary">Correo verificado.</p>
      ) : (
        <div className="mt-3">
          <button
            type="button"
            disabled={resending}
            className="font-display text-sm font-semibold text-primary disabled:opacity-60"
            onClick={() => {
              setResending(true);
              setResendMessage("");
              void resendVerification(user.email)
                .then(() => setResendMessage("Si el correo está pendiente, el enlace quedó en el log del API."))
                .catch((caught: unknown) => setResendMessage(apiErrorMessage(caught, "No pudimos reenviar la verificación.")))
                .finally(() => setResending(false));
            }}
          >
            {resending ? "Enviando enlace…" : "Reenviar verificación de correo"}
          </button>
          {resendMessage ? <p className="mt-2 text-sm text-ink-soft">{resendMessage}</p> : null}
        </div>
      )}
      {error ? (
        <p className="mt-3 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { patient } = useClinic();
  const exclusive = patient.assignment?.source === "psychologist";
  return (
    <PortalShell role="patient" person={user?.name ?? patient.name} detail={exclusive ? "Proceso con tu psicólogo" : "Paciente activo"}>
      {children}
    </PortalShell>
  );
}

export function PatientHomePage() {
  const { user } = useAuth();
  const { patient, appointmentsFor } = useClinic();
  const name = user?.name ?? patient.name;
  const next = appointmentsFor({ patientId: patient.id }).find((item) => item.date >= todayIso());
  const listener = patient.assignment ? psychById(patient.assignment.psychologistId) : null;

  return (
    <Frame>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">Hola, {name.split(" ")[0]}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">Tu calendario, tu escuchadero y la sala de la sesión están en el mismo lugar.</p>
      <AccountConnection />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <p className="font-display text-sm font-semibold text-primary">Próxima cita</p>
          {next ? (
            <>
              <h2 className="mt-2 font-display text-2xl font-semibold">{formatLongDate(next.date)}</h2>
              <p className="mt-1 text-ink-soft">
                {next.time} · {psychById(next.psychologistId).name} · {next.mode === "virtual" ? "Virtual" : "Presencial"}
              </p>
              <Link to="/paciente/sala" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 font-display text-sm font-semibold text-white">
                Entrar a la sesión virtual
                <Icon name="arrow_forward" className="text-[18px]" />
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-ink-soft">Todavía no tienes una cita. Puedes elegir un horario con un psicólogo afín a lo que estás viviendo.</p>
              <Link to="/paciente/agendar" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-3 font-display text-sm font-semibold text-white">
                Agendar mi cita
              </Link>
            </>
          )}
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 font-display text-sm font-semibold text-primary">
            <Icon name="chat" className="text-[20px]" />
            El Escuchadero
          </div>
          <p className="mt-2 text-ink-soft">
            {listener
              ? `${listener.name} puede escucharte antes de que llegue la cita.`
              : "Puedes escribirle a un psicólogo para que te escuche antes de agendar."}
          </p>
          <Link to="/paciente/escuchadero" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-surface-mid px-4 py-3 font-display text-sm font-semibold text-primary">
            <Icon name="chat" className="text-[18px]" />
            Abrir conversación
          </Link>
        </article>
      </div>
    </Frame>
  );
}

export function PatientAppointmentsPage() {
  const { patient, appointmentsFor } = useClinic();
  const items = appointmentsFor({ patientId: patient.id });
  const marked = items.map((item) => item.date);
  const [selected, setSelected] = useState(marked[0] ?? todayIso());
  const dayItems = items.filter((item) => item.date === selected);

  return (
    <Frame>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold text-primary">Mis citas</h1>
          <p className="mt-2 text-ink-soft">El calendario muestra tus sesiones. Desde aquí entras a la sala virtual.</p>
        </div>
        <Link to="/paciente/agendar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-display text-sm font-semibold text-white">
          <Icon name="add" className="text-[18px]" />
          Agendar
        </Link>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <MonthCalendar marked={marked} selected={selected} onSelect={setSelected} />
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-display text-lg font-semibold">{formatLongDate(selected)}</h2>
          <div className="mt-4 space-y-3">
            {dayItems.length === 0 ? <p className="text-sm text-ink-soft">No hay citas este día.</p> : null}
            {dayItems.map((item) => {
              const psych = psychById(item.psychologistId);
              return (
                <article key={item.id} className="rounded-xl bg-surface-low p-4">
                  <p className="font-display font-semibold">{item.time}</p>
                  <p className="text-sm text-ink-soft">
                    {psych.name} · {item.mode === "virtual" ? "Virtual" : "Presencial"}
                  </p>
                  {item.mode === "virtual" ? (
                    <Link to="/paciente/sala" className="mt-3 inline-flex text-sm font-semibold text-primary">
                      Entrar a la sesión virtual
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </Frame>
  );
}

export function PatientBookPage() {
  const { patient, visiblePsychologists, slots, slotTaken, bookAsPatient } = useClinic();
  const options = visiblePsychologists(patient);
  const exclusive = patient.assignment?.source === "psychologist";
  const [psychId, setPsychId] = useState<PsychId>(options[0]?.id ?? "carlos");
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<Mode>("virtual");
  const [notice, setNotice] = useState("");
  const chosen = options.find((item) => item.id === psychId) ?? options[0];

  return (
    <Frame>
      <h1 className="font-display text-3xl font-semibold text-primary">Agendar cita</h1>
      {exclusive && chosen ? (
        <p className="mt-3 rounded-xl bg-primary/10 px-4 py-3 text-sm leading-6 text-primary">
          {chosen.name} agendó tu proceso. Tus citas quedan con esta persona. Otro psicólogo solo aparece si decide pasarte.
        </p>
      ) : (
        <p className="mt-3 text-ink-soft">
          Según lo que registraste ({patient.concerns.join(", ")}), estos son los psicólogos con los que puedes sacar tu cita.
        </p>
      )}
      <div className="mt-6 grid gap-4">
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPsychId(item.id)}
            className={`flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ${psychId === item.id ? "ring-2 ring-primary-container" : ""}`}
          >
            <img src={item.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            <span>
              <span className="block font-display text-lg font-semibold">{item.name}</span>
              <span className="block text-sm text-ink-soft">
                {item.approach} · {item.focus.join(" · ")}
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <MonthCalendar marked={[]} selected={date} onSelect={setDate} />
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-display text-lg font-semibold">{formatLongDate(date)}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {slots.map((slot) => {
              const taken = chosen ? slotTaken(chosen.id, date, slot) : false;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={taken}
                  onClick={() => setTime(slot)}
                  className={`rounded-lg px-3 py-3 text-sm font-semibold ${time === slot ? "bg-primary-container text-white" : "bg-surface-mid text-ink"} disabled:opacity-40`}
                >
                  {slot}
                  {taken ? " · ocupado" : ""}
                </button>
              );
            })}
          </div>
          <label className="mt-4 block font-display text-sm font-semibold">
            Modalidad
            <select className={`${fieldClass} mt-2`} value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
            </select>
          </label>
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-primary py-3 font-display font-semibold text-white"
            onClick={() => {
              if (!chosen || !time) {
                setNotice("Elige psicólogo, día y hora.");
                return;
              }
              const error = bookAsPatient(chosen.id, date, time, mode);
              setNotice(error || `Cita registrada con ${chosen.name} el ${formatLongDate(date)} a las ${time}.`);
              if (!error) setTime("");
            }}
          >
            Registrar cita
          </button>
          {notice ? <p className="mt-3 text-sm text-primary">{notice}</p> : null}
        </section>
      </div>
    </Frame>
  );
}
