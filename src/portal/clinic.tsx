import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type PsychId = "carlos" | "laura" | "sofia";
export type Mode = "virtual" | "presencial";

export type Psychologist = {
  id: PsychId;
  name: string;
  role: string;
  approach: string;
  focus: string[];
  image: string;
  card: string;
};

export type Patient = {
  id: string;
  name: string;
  concerns: string[];
  assignment: { psychologistId: PsychId; source: "patient" | "psychologist" } | null;
};

export type Appointment = {
  id: string;
  patientId: string;
  psychologistId: PsychId;
  date: string;
  time: string;
  mode: Mode;
  status: "confirmada" | "pendiente";
  bookedBy: "patient" | "psychologist";
};

export type ChatMessage = {
  id: string;
  from: "patient" | "psychologist";
  text: string;
  time: string;
};

export const psychologists: Psychologist[] = [
  {
    id: "carlos",
    name: "Dr. Carlos Morales",
    role: "Psicólogo clínico",
    approach: "Terapia sistémica",
    focus: ["Ansiedad", "Familia", "Adultos"],
    image: "/images/psych-carlos.png",
    card: "TP-108429-COL",
  },
  {
    id: "laura",
    name: "Dra. Laura Gómez",
    role: "Psicóloga",
    approach: "Acompañamiento emocional",
    focus: ["Ansiedad", "Estrés", "Pareja"],
    image: "/images/psych-laura.png",
    card: "TP-204118-COL",
  },
  {
    id: "sofia",
    name: "Lic. Sofía Valenzuela",
    role: "Psicóloga",
    approach: "Mindfulness",
    focus: ["Burnout", "Estrés", "Regulación"],
    image: "/images/psych-sofia.jpg",
    card: "TP-331902-COL",
  },
];

const initialPatients: Patient[] = [
  { id: "mariana", name: "Mariana Gómez", concerns: ["Ansiedad", "Estrés"], assignment: null },
  {
    id: "valentina",
    name: "Valentina Morales Gómez",
    concerns: ["Ansiedad"],
    assignment: { psychologistId: "carlos", source: "psychologist" },
  },
  {
    id: "andres",
    name: "Carlos Andrés Peña",
    concerns: ["Familia"],
    assignment: { psychologistId: "carlos", source: "psychologist" },
  },
];

const initialAppointments: Appointment[] = [
  {
    id: "c1",
    patientId: "valentina",
    psychologistId: "carlos",
    date: "2026-10-29",
    time: "16:00",
    mode: "virtual",
    status: "confirmada",
    bookedBy: "psychologist",
  },
  {
    id: "c2",
    patientId: "andres",
    psychologistId: "carlos",
    date: "2026-10-31",
    time: "11:30",
    mode: "virtual",
    status: "confirmada",
    bookedBy: "psychologist",
  },
];

const slots = ["09:00", "11:30", "14:00", "16:00"];

type ClinicValue = {
  patients: Patient[];
  appointments: Appointment[];
  messages: ChatMessage[];
  currentPatientId: string;
  currentPsychId: PsychId;
  patient: Patient;
  psychologist: Psychologist;
  sendMessage: (from: ChatMessage["from"], text: string) => void;
  bookAsPatient: (psychologistId: PsychId, date: string, time: string, mode: Mode) => string;
  bookAsPsychologist: (patientId: string, date: string, time: string, mode: Mode) => string;
  transferPatient: (patientId: string, psychologistId: PsychId) => void;
  visiblePsychologists: (patient: Patient) => Psychologist[];
  appointmentsFor: (filter: { patientId?: string; psychologistId?: PsychId }) => Appointment[];
  slotTaken: (psychologistId: PsychId, date: string, time: string) => boolean;
  slots: string[];
};

const ClinicContext = createContext<ClinicValue | null>(null);

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState(() => readStored("mu-patients", initialPatients));
  const [appointments, setAppointments] = useState(() => ensureTodaySession(readStored("mu-appointments", initialAppointments)));
  const [messages, setMessages] = useState<ChatMessage[]>(() => readStored("mu-messages", [
    {
      id: "m1",
      from: "psychologist",
      text: "Hola Mariana, bienvenida al Escuchadero. Estoy aquí contigo. Tómate el tiempo que necesites, ¿cómo te sientes en este instante?",
      time: "14:18",
    },
  ]));

  useEffect(() => {
    sessionStorage.setItem("mu-patients", JSON.stringify(patients));
    sessionStorage.setItem("mu-appointments", JSON.stringify(appointments));
    sessionStorage.setItem("mu-messages", JSON.stringify(messages));
  }, [appointments, messages, patients]);

  const currentPatientId = "mariana";
  const currentPsychId: PsychId = "carlos";

  const value = useMemo<ClinicValue>(() => {
    const patient = patients.find((item) => item.id === currentPatientId) ?? patients[0];
    const psychologist = psychologists.find((item) => item.id === currentPsychId) ?? psychologists[0];

    function visiblePsychologists(person: Patient) {
      if (person.assignment?.source === "psychologist") {
        return psychologists.filter((item) => item.id === person.assignment?.psychologistId);
      }
      return psychologists.filter((item) => item.focus.some((topic) => person.concerns.includes(topic)));
    }

    function slotTaken(psychologistId: PsychId, date: string, time: string) {
      return appointments.some((item) => item.psychologistId === psychologistId && item.date === date && item.time === time);
    }

    return {
      patients,
      appointments,
      messages,
      currentPatientId,
      currentPsychId,
      patient,
      psychologist,
      slots,
      visiblePsychologists,
      slotTaken,
      appointmentsFor: (filter) =>
        appointments
          .filter((item) => (filter.patientId ? item.patientId === filter.patientId : true))
          .filter((item) => (filter.psychologistId ? item.psychologistId === filter.psychologistId : true))
          .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
      sendMessage: (from, text) => {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        setMessages((current) => [...current, { id: `m${current.length + 1}`, from, text, time }]);
      },
      bookAsPatient: (psychologistId, date, time, mode) => {
        if (patient.assignment?.source === "psychologist" && patient.assignment.psychologistId !== psychologistId) {
          return "Tu proceso ya está con un psicólogo. Solo él puede pasarte con otro.";
        }
        if (slotTaken(psychologistId, date, time)) return "Ese horario ya está ocupado.";
        const id = `c${Date.now()}`;
        setAppointments((current) => [
          ...current,
          { id, patientId: patient.id, psychologistId, date, time, mode, status: "confirmada", bookedBy: "patient" },
        ]);
        if (!patient.assignment) {
          setPatients((current) =>
            current.map((item) => (item.id === patient.id ? { ...item, assignment: { psychologistId, source: "patient" } } : item)),
          );
        }
        return "";
      },
      bookAsPsychologist: (patientId, date, time, mode) => {
        if (slotTaken(currentPsychId, date, time)) return "Ese horario ya está en tu agenda.";
        const id = `c${Date.now()}`;
        setAppointments((current) => [
          ...current,
          { id, patientId, psychologistId: currentPsychId, date, time, mode, status: "confirmada", bookedBy: "psychologist" },
        ]);
        setPatients((current) =>
          current.map((item) =>
            item.id === patientId ? { ...item, assignment: { psychologistId: currentPsychId, source: "psychologist" } } : item,
          ),
        );
        return "";
      },
      transferPatient: (patientId, psychologistId) => {
        setPatients((current) =>
          current.map((item) => (item.id === patientId ? { ...item, assignment: { psychologistId, source: "psychologist" } } : item)),
        );
        setAppointments((current) =>
          current.map((item) => {
            if (item.patientId !== patientId || item.date < todayIso()) return item;
            return { ...item, psychologistId };
          }),
        );
      },
    };
  }, [appointments, messages, patients]);

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const value = useContext(ClinicContext);
  if (!value) throw new Error("useClinic debe usarse dentro del portal");
  return value;
}

export function psychById(id: PsychId) {
  return psychologists.find((item) => item.id === id) ?? psychologists[0];
}

export function formatLongDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function clockLabel(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "p. m." : "a. m.";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function sessionPhase(date: string, time: string): "antes" | "lista" | "en_curso" | "despues" {
  if (date !== todayIso()) return date > todayIso() ? "antes" : "despues";
  const [hour, minute] = time.split(":").map(Number);
  const now = new Date();
  const delta = now.getHours() * 60 + now.getMinutes() - (hour * 60 + minute);
  if (delta < -10) return "antes";
  if (delta < 0) return "lista";
  if (delta <= 50) return "en_curso";
  return "despues";
}

export function sessionPhaseText(phase: ReturnType<typeof sessionPhase>, time: string) {
  const hour = clockLabel(time);
  if (phase === "antes") return `La sala se abre 10 minutos antes de las ${hour}`;
  if (phase === "lista") return `Faltan unos minutos para las ${hour} Ya puedes iniciar la sesión.`;
  if (phase === "en_curso") return `Son las ${hour} Al iniciar, el historial queda a la izquierda y la nota de esta sesión a la derecha.`;
  return `La hora de las ${hour} ya pasó. La sala sigue abierta para dejar la nota de la sesión.`;
}

function ensureTodaySession(items: Appointment[]): Appointment[] {
  const model: Appointment = {
    id: "sesion-hoy-2035",
    patientId: "valentina",
    psychologistId: "carlos",
    date: todayIso(),
    time: "20:35",
    mode: "virtual",
    status: "confirmada",
    bookedBy: "psychologist",
  };
  return [...items.filter((item) => item.id !== model.id), model];
}
