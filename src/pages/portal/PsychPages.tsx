import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchPsychologistAccess } from "../../api/auth";
import { apiErrorMessage } from "../../api/client";
import type { PsychologistAccess } from "../../api/types";
import { useAuth } from "../../auth/AuthProvider";
import { Icon } from "../../components/Icon";
import { PortalShell } from "../../components/PortalShell";
import { fieldClass } from "../../components/ui";
import { MonthCalendar } from "../../portal/Calendar";
import { fetchPsychAppointments, type PsychAppointment } from "../../api/clinical";
import { clockLabel, formatLongDate, sessionPhase, sessionPhaseText, todayIso, useClinic, type Mode } from "../../portal/clinic";

function ProfessionalAccess() {
  const [access, setAccess] = useState<PsychologistAccess | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchPsychologistAccess()
      .then((next) => {
        if (!cancelled) setAccess(next);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(apiErrorMessage(caught, "No pudimos consultar tu acceso profesional."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="rounded-xl bg-white px-4 py-3 text-sm text-error" role="alert">
        {error}
      </p>
    );
  }

  if (!access) return <p className="text-sm text-ink-soft">Consultando tu verificación…</p>;

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="font-display text-sm font-semibold text-primary">Acceso profesional</p>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        {access.professionalAccess
          ? "Tu verificación está aprobada y el área profesional está habilitada."
          : `Tu verificación está en ${access.verificationStatus}. Cuando un administrador la apruebe, se abren el panel, la agenda, la clínica y la comunidad.`}
      </p>
    </article>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { psychologist } = useClinic();
  const pending = user?.psychologist ? !user.psychologist.professionalAccess : false;
  return (
    <PortalShell role="psychologist" person={user?.name ?? psychologist.name} detail={pending ? "Verificación pendiente" : "Portal clínico"}>
      {children}
    </PortalShell>
  );
}

function bogotaDate(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

function bogotaTime(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
}

function loadPsychAppointments() {
  return Promise.all([fetchPsychAppointments("upcoming"), fetchPsychAppointments("history"), fetchPsychAppointments("requests")]).then((groups) =>
    groups.flatMap((group) => group.items),
  );
}

export function PsychHomePage() {
  const { user } = useAuth();
  const { appointments, patients, currentPsychId } = useClinic();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;
  const [items, setItems] = useState<PsychAppointment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadPsychAppointments()
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(apiErrorMessage(caught, "No pudimos leer tu agenda."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const linkedPatients = new Set(items.map((item) => item.patient.id)).size;
  const today = items.filter((item) => bogotaDate(item.startAt) === todayIso());
  const localToday = appointments.filter((item) => item.psychologistId === currentPsychId && item.date === todayIso() && !today.some((remote) => remote.id === item.id));
  const todayCount = today.length + localToday.length;
  const scheduled = items.filter((item) => item.status === "CONFIRMED" || item.status === "IN_PROGRESS" || item.status === "PENDING").length + localToday.length;

  return (
    <Frame>
      {notice ? <p className="mb-4 rounded-xl bg-primary/10 px-4 py-3 text-sm leading-6 text-primary">{notice}</p> : null}
      <ProfessionalAccess />
      <div className="mt-6 rounded-2xl bg-primary-container p-5 text-white sm:p-8">
        <p className="text-sm text-primary-fixed">Semana clínica</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Buenos días, {user?.name ?? "profesional"}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-surface-highest">
          Hoy tienes {todayCount} {todayCount === 1 ? "sesión" : "sesiones"} en el calendario.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link to="/psicologo/agendar" className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 font-display text-sm font-semibold text-primary">
            Agendar sesión
          </Link>
          <Link to="/psicologo/sala?cita=sesion-hoy-2035" className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 font-display text-sm font-semibold text-white">
            Ver sala virtual de hoy
          </Link>
        </div>
      </div>
      {error ? <p className="mt-6 rounded-xl bg-secondary/10 px-4 py-3 text-sm text-secondary">{error}</p> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Pacientes vinculados", String(linkedPatients)],
          ["Citas de hoy", String(todayCount)],
          ["En el calendario", String(scheduled)],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-primary">{value}</p>
          </article>
        ))}
      </div>
      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-xl font-semibold">Agenda de hoy</h2>
        <div className="mt-4 space-y-3">
          {todayCount === 0 ? <p className="text-sm text-ink-soft">No hay sesiones para hoy.</p> : null}
          {localToday.map((item) => {
            const person = patients.find((entry) => entry.id === item.patientId);
            const phase = sessionPhase(item.date, item.time);
            return (
              <div key={item.id} className="flex flex-col gap-3 rounded-xl bg-surface-low p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display font-semibold">{clockLabel(item.time)}</p>
                  <p className="text-sm text-ink-soft">
                    {person?.name ?? "Paciente"} · {item.mode === "virtual" ? "Virtual" : "Presencial"}
                  </p>
                  {item.mode === "virtual" ? <p className="mt-2 text-sm leading-6 text-primary">{sessionPhaseText(phase, item.time)}</p> : null}
                </div>
                {item.mode === "virtual" ? (
                  <Link to={`/psicologo/sala?cita=${item.id}`} className="inline-flex justify-center rounded-lg bg-primary-container px-4 py-2 font-display text-sm font-semibold text-white">
                    Iniciar sesión
                  </Link>
                ) : null}
              </div>
            );
          })}
          {today.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-xl bg-surface-low p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display font-semibold">{bogotaTime(item.startAt)}</p>
                <p className="text-sm text-ink-soft">
                  {item.patient.name} · {item.modality === "ONLINE" ? "Virtual" : "Presencial"}
                </p>
              </div>
              {item.modality === "ONLINE" ? (
                <Link to="/psicologo/sala" className="inline-flex justify-center rounded-lg bg-primary-container px-4 py-2 font-display text-sm font-semibold text-white">
                  Entrar
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </Frame>
  );
}

type AgendaVisit = { id: string; date: string; time: string; timeLabel: string; name: string; place: string; virtual: boolean };

export function PsychAgendaPage() {
  const location = useLocation();
  const openedOn = (location.state as { date?: string } | null)?.date;
  const { appointments, patients, currentPsychId } = useClinic();
  const [remote, setRemote] = useState<PsychAppointment[]>([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(openedOn && /^\d{4}-\d{2}-\d{2}$/.test(openedOn) ? openedOn : todayIso());
  const saved: AgendaVisit[] = appointments
    .filter((item) => item.psychologistId === currentPsychId)
    .map((item) => {
      const person = patients.find((entry) => entry.id === item.patientId);
      return {
        id: item.id,
        date: item.date,
        time: item.time,
        timeLabel: clockLabel(item.time),
        name: person?.name ?? "Paciente",
        place: item.mode === "virtual" ? "Virtual" : "Presencial",
        virtual: item.mode === "virtual",
      };
    });
  const visits: AgendaVisit[] = [
    ...remote
      .filter((item) => !saved.some((entry) => entry.id === item.id))
      .map((item) => ({
        id: item.id,
        date: bogotaDate(item.startAt),
        time: bogotaTime(item.startAt),
        timeLabel: bogotaTime(item.startAt),
        name: item.patient.name,
        place: item.modality === "ONLINE" ? "Virtual" : "Presencial",
        virtual: item.modality === "ONLINE",
      })),
    ...saved,
  ];
  const dayItems = visits.filter((item) => item.date === selected);

  useEffect(() => {
    let cancelled = false;
    loadPsychAppointments()
      .then((next) => {
        if (!cancelled) setRemote(next);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(apiErrorMessage(caught, "No pudimos leer tu agenda."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Frame>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold text-primary">Agenda y mis citas</h1>
          <p className="mt-2 text-ink-soft">Ves y agendas las sesiones de las personas que están en tu proceso.</p>
        </div>
        <Link to="/psicologo/agendar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-display text-sm font-semibold text-white">
          <Icon name="add" className="text-[18px]" />
          Agendar sesión
        </Link>
      </div>
      {error ? <p className="mt-6 rounded-xl bg-secondary/10 px-4 py-3 text-sm text-secondary">{error}</p> : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <MonthCalendar marked={visits.map((item) => item.date)} selected={selected} onSelect={setSelected} />
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-display text-lg font-semibold">{formatLongDate(selected)}</h2>
          <div className="mt-4 space-y-3">
            {dayItems.length === 0 ? <p className="text-sm text-ink-soft">Este día está libre.</p> : null}
            {dayItems.map((item) => {
              const phase = sessionPhase(item.date, item.time);
              return (
                <article key={item.id} className="rounded-xl bg-surface-low p-4">
                  <p className="font-display font-semibold">{item.timeLabel}</p>
                  <p className="text-sm text-ink-soft">
                    {item.name} · {item.place}
                  </p>
                  {item.virtual ? <p className="mt-2 text-sm leading-6 text-primary">{sessionPhaseText(phase, item.time)}</p> : null}
                  {item.virtual ? (
                    <Link to={`/psicologo/sala?cita=${item.id}`} className="mt-3 inline-flex rounded-lg bg-primary-container px-4 py-2 font-display text-sm font-semibold text-white">
                      Iniciar sesión
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

export function PsychPatientsPage() {
  const [people, setPeople] = useState<{ id: string; name: string; alias: string; visits: number }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadPsychAppointments()
      .then((appointments) => {
        if (cancelled) return;
        const byPatient = new Map<string, { id: string; name: string; alias: string; visits: number }>();
        appointments.forEach((item: PsychAppointment) => {
          const current = byPatient.get(item.patient.id);
          if (current) current.visits += 1;
          else byPatient.set(item.patient.id, { id: item.patient.id, name: item.patient.name, alias: item.patient.alias, visits: 1 });
        });
        setPeople([...byPatient.values()]);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(apiErrorMessage(caught, "No pudimos leer tus pacientes."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Frame>
      <h1 className="font-display text-3xl font-semibold text-primary">Pacientes</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">Abre la ficha para ver la historia, las notas clínicas y el RIPS de cada atención.</p>
      {loading ? <p className="mt-6 text-sm text-ink-soft">Cargando pacientes…</p> : null}
      {error ? <p className="mt-6 rounded-xl bg-secondary/10 px-4 py-3 text-sm text-secondary">{error}</p> : null}
      {!loading && !error && people.length === 0 ? <p className="mt-6 text-sm text-ink-soft">Todavía no hay pacientes en tu agenda.</p> : null}
      <div className="mt-6 grid gap-4">
        {people.map((person) => (
          <article key={person.id} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">{person.name}</h2>
              <p className="text-sm text-ink-soft">{person.alias} · {person.visits} {person.visits === 1 ? "atención" : "atenciones"}</p>
            </div>
            <Link
              to={`/psicologo/pacientes/${person.id}?nombre=${encodeURIComponent(person.name)}&alias=${encodeURIComponent(person.alias)}`}
              className="inline-flex justify-center rounded-xl bg-primary-container px-4 py-3 font-display text-sm font-semibold text-white"
            >
              Ver ficha
            </Link>
          </article>
        ))}
      </div>
    </Frame>
  );
}

export function PsychBookPage() {
  const navigate = useNavigate();
  const { appointments, patients, slots, slotTaken, bookAsPsychologist, currentPsychId } = useClinic();
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<Mode>("virtual");
  const [notice, setNotice] = useState("");

  return (
    <Frame>
      <h1 className="font-display text-3xl font-semibold text-primary">Agendar sesión</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Al guardar, la persona queda con tus citas y no podrá agendar con otro psicólogo, salvo que tú la transfieras.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <label className="block font-display text-sm font-semibold">
            Paciente
            <select className={`${fieldClass} mt-2`} value={patientId} onChange={(event) => setPatientId(event.target.value)}>
              {patients.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-5">
            <MonthCalendar marked={appointments.filter((item) => item.psychologistId === currentPsychId).map((item) => item.date)} selected={date} onSelect={setDate} />
          </div>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-display text-lg font-semibold">{formatLongDate(date)}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {slots.map((slot) => {
              const taken = slotTaken(currentPsychId, date, slot);
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={taken}
                  onClick={() => setTime(slot)}
                  className={`rounded-lg px-3 py-3 text-sm font-semibold ${time === slot ? "bg-primary-container text-white" : "bg-surface-mid"} disabled:opacity-40`}
                >
                  {slot}
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
              if (!time) {
                setNotice("Elige una hora.");
                return;
              }
              const error = bookAsPsychologist(patientId, date, time, mode);
              if (error) {
                setNotice(error);
                return;
              }
              navigate("/psicologo/agenda", { state: { date } });
            }}
          >
            Guardar en el calendario
          </button>
          {notice ? <p className="mt-3 text-sm leading-6 text-primary">{notice}</p> : null}
        </section>
      </div>
    </Frame>
  );
}
