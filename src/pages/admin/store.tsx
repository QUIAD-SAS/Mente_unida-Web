import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type DossierStatus = "pendiente" | "subsanacion" | "aprobado";

export type Dossier = {
  id: string;
  name: string;
  initials: string;
  card: string;
  specialty: string;
  experience: string;
  waiting: string;
  priority: string;
  status: DossierStatus;
  document: string;
  resolution: string;
  license: string;
  supports: { name: string; state: string }[];
  checks: { label: string; state: string }[];
  note: string;
};

export type PatientAccount = {
  id: string;
  initials: string;
  name: string;
  doc: string;
  city: string;
  therapist: string;
  role: string;
  session: string;
  consent: "Firmado" | "Pendiente" | "Tutor";
  status: "Activo" | "Pausado" | "Pendiente";
  email: string;
  phone: string;
  emergency: string;
  kind: "activo" | "nuevo" | "pausado";
};

export type ModerationCase = {
  id: string;
  initials: string;
  author: string;
  meta: string;
  flag: string;
  quote: string;
  reason: string;
  status: "revision" | "atendido" | "oculto" | "descartado";
  severity: "alta" | "media" | "baja";
};

export type AdminSettings = {
  remindersEmail: boolean;
  remindersSms: boolean;
  requireRethus: boolean;
  alertWords: string;
};

const initialDossiers: Dossier[] = [
  {
    id: "marcela",
    name: "Dra. Marcela Quintana Salazar",
    initials: "MQ",
    card: "TP-149822",
    specialty: "Psicología clínica · Univ. Nacional",
    experience: "8 años exp.",
    waiting: "Hace 2 días",
    priority: "Prioritario",
    status: "pendiente",
    document: "C.C. 1.020.485.912",
    resolution: "RESOL-2016-09142",
    license: "Acreditada Telepsicología",
    supports: [
      { name: "Tarjeta profesional", state: "Colpsic vigente" },
      { name: "Diploma y acta", state: "Univ. Nacional" },
      { name: "Certificado deontológico", state: "Tribunal de Ética" },
    ],
    checks: [
      { label: "Identidad y cédula cotejadas con RETHUS", state: "Verificado" },
      { label: "Habilitación y ausencia de sanciones", state: "Verificado" },
      { label: "Consentimiento de telepsicología", state: "Firmado" },
    ],
    note: "Revisión lista para habilitar en el directorio.",
  },
  {
    id: "felipe",
    name: "Dr. Felipe Echeverri",
    initials: "FE",
    card: "TP-103984",
    specialty: "Neuropsicología cognitiva",
    experience: "Pre-cotejo OK",
    waiting: "Hace 3 días",
    priority: "En turno",
    status: "pendiente",
    document: "C.C. 80.441.220",
    resolution: "RESOL-2019-04410",
    license: "Acreditada Telepsicología",
    supports: [
      { name: "Tarjeta profesional", state: "Colpsic vigente" },
      { name: "Diploma y acta", state: "Univ. de Antioquia" },
      { name: "Registro RETHUS", state: "Por cotejar" },
    ],
    checks: [
      { label: "Identidad y cédula cotejadas con RETHUS", state: "En revisión" },
      { label: "Habilitación y ausencia de sanciones", state: "Verificado" },
      { label: "Consentimiento de telepsicología", state: "Firmado" },
    ],
    note: "Falta el cotejo final del registro RETHUS.",
  },
  {
    id: "valentina",
    name: "Dra. Valentina Sierra",
    initials: "VS",
    card: "TP-112349",
    specialty: "Psicología infantil y familiar",
    experience: "Falta acta maestra",
    waiting: "Hace 4 días",
    priority: "Falta soporte",
    status: "subsanacion",
    document: "C.C. 1.015.332.008",
    resolution: "Pendiente",
    license: "En revisión",
    supports: [
      { name: "Tarjeta profesional", state: "Adjunta" },
      { name: "Diploma y acta", state: "Falta acta" },
      { name: "Registro RETHUS", state: "Adjunta" },
    ],
    checks: [
      { label: "Identidad y cédula cotejadas con RETHUS", state: "Verificado" },
      { label: "Habilitación y ausencia de sanciones", state: "Pendiente" },
      { label: "Consentimiento de telepsicología", state: "Firmado" },
    ],
    note: "Se solicitó el acta de grado para continuar.",
  },
  {
    id: "andres",
    name: "Dr. Andrés Morales",
    initials: "AM",
    card: "TP-221004",
    specialty: "Terapia de pareja",
    experience: "12 años exp.",
    waiting: "Hace 1 día",
    priority: "Habilitado",
    status: "aprobado",
    document: "C.C. 79.220.118",
    resolution: "RESOL-2014-01880",
    license: "Acreditada Telepsicología",
    supports: [
      { name: "Tarjeta profesional", state: "Vigente" },
      { name: "Diploma y acta", state: "Completo" },
      { name: "Registro RETHUS", state: "Activo" },
    ],
    checks: [
      { label: "Identidad y cédula cotejadas con RETHUS", state: "Verificado" },
      { label: "Habilitación y ausencia de sanciones", state: "Verificado" },
      { label: "Consentimiento de telepsicología", state: "Firmado" },
    ],
    note: "Habilitado en el directorio.",
  },
];

const initialPatients: PatientAccount[] = [
  { id: "MU-COL-8924", initials: "MG", name: "Mariana Sofía Gómez Restrepo", doc: "1.020.345.890", city: "Bogotá, D.C.", therapist: "Dra. Laura Gómez", role: "Psicología clínica", session: "Hace 2 días", consent: "Firmado", status: "Activo", email: "mariana.gomez@correo.com", phone: "+57 310 445 8842", emergency: "Sofía Restrepo (Madre) · +57 310 445 1190", kind: "activo" },
  { id: "MU-COL-7412", initials: "DR", name: "David Ricardo Restrepo Morales", doc: "1.032.411.782", city: "Medellín, Ant.", therapist: "Dr. Carlos Morales", role: "Terapia sistémica", session: "Ayer", consent: "Firmado", status: "Activo", email: "david.restrepo@correo.com", phone: "+57 300 221 1904", emergency: "Ana Morales (Madre) · +57 300 118 2201", kind: "activo" },
  { id: "MU-COL-3301", initials: "CP", name: "Carlos Manuel Pineda Ochoa", doc: "1.018.992.341", city: "Cali, Valle", therapist: "En espera", role: "Sin asignar", session: "Alta hace 3 h", consent: "Pendiente", status: "Pendiente", email: "carlos.pineda@correo.com", phone: "+57 312 880 4412", emergency: "Lucía Ochoa (Madre) · +57 312 880 1002", kind: "nuevo" },
  { id: "MU-COL-5510", initials: "AM", name: "Andrea Carolina Méndez Vera", doc: "52.890.123", city: "Bucaramanga, Sder.", therapist: "Dra. Valentina Sierra", role: "Infantil y familiar", session: "Hace 1 sem", consent: "Firmado", status: "Activo", email: "andrea.mendez@correo.com", phone: "+57 315 662 0091", emergency: "Pedro Méndez (Padre) · +57 315 662 4410", kind: "activo" },
  { id: "MU-COL-9105", initials: "SE", name: "Santiago Andrés Echeverri", doc: "1.098.223.456", city: "Pereira, Ris.", therapist: "Dra. Marcela Quintana", role: "Tutor: Marta E.", session: "Sesión 18 Oct", consent: "Tutor", status: "Activo", email: "santiago.echeverri@correo.com", phone: "+57 320 114 7781", emergency: "Marta Echeverri (Madre) · +57 320 114 2200", kind: "activo" },
  { id: "MU-COL-6380", initials: "LS", name: "Lucía Fernanda Salazar", doc: "1.026.784.990", city: "Manizales, Cal.", therapist: "Dr. Carlos Morales", role: "Terapia sistémica", session: "Hace 1 mes", consent: "Firmado", status: "Pausado", email: "lucia.salazar@correo.com", phone: "+57 301 778 3344", emergency: "Elena Salazar (Hermana) · +57 301 778 1008", kind: "pausado" },
];

const initialCases: ModerationCase[] = [
  {
    id: "MOD-8942",
    initials: "MC",
    author: "Mariana C.",
    meta: "Hace 15 min · Paciente",
    flag: "Alerta de crisis",
    quote: "Siento que no puedo más con esta presión hoy. No duermo hace días y cada mañana se me hace imposible levantarme.",
    reason: "Detección de desesperanza aguda e insomnio grave.",
    status: "revision",
    severity: "alta",
  },
  {
    id: "MOD-3901",
    initials: "U3",
    author: "Usuario_3910",
    meta: "Hace 45 min · Cuenta reciente",
    flag: "Reportado",
    quote: "Prueben estas gotas naturales garantizadas para eliminar el estrés en 3 minutos sin terapia.",
    reason: "Promoción de producto no autorizado.",
    status: "revision",
    severity: "media",
  },
  {
    id: "MOD-2204",
    initials: "FM",
    author: "Felipe M.",
    meta: "Hace 2 horas · Foro de ansiedad",
    flag: "Consulta clínica",
    quote: "Llevo 4 semanas tomando Sertralina de 50 mg y olvidé la dosis. ¿Debería tomar dos pastillas juntas para compensar?",
    reason: "Requiere advertencia médica y respuesta colegiada.",
    status: "revision",
    severity: "media",
  },
  {
    id: "MOD-1188",
    initials: "CL",
    author: "Camila L.",
    meta: "Hace 3 horas · Círculo Crianza consciente",
    flag: "En revisión preventiva",
    quote: "Quiero agradecer al grupo por la escucha de esta semana.",
    reason: "Revisión preventiva del círculo.",
    status: "revision",
    severity: "baja",
  },
];

type AdminValue = {
  dossiers: Dossier[];
  patients: PatientAccount[];
  cases: ModerationCase[];
  settings: AdminSettings;
  therapists: string[];
  setDossierStatus: (id: string, status: DossierStatus, note: string) => void;
  setPatient: (id: string, patch: Partial<PatientAccount>) => void;
  setCaseStatus: (id: string, status: ModerationCase["status"]) => void;
  saveSettings: (next: AdminSettings) => void;
};

const AdminContext = createContext<AdminValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [dossiers, setDossiers] = useState(initialDossiers);
  const [patients, setPatients] = useState(initialPatients);
  const [cases, setCases] = useState(initialCases);
  const [settings, setSettings] = useState<AdminSettings>({
    remindersEmail: true,
    remindersSms: false,
    requireRethus: true,
    alertWords: "no puedo más, insomnio, crisis, autolesión",
  });

  const value = useMemo<AdminValue>(
    () => ({
      dossiers,
      patients,
      cases,
      settings,
      therapists: ["Dra. Laura Gómez", "Dr. Carlos Morales", "Lic. Sofía Valenzuela", "Dra. Marcela Quintana"],
      setDossierStatus: (id, status, note) => {
        setDossiers((current) => current.map((item) => (item.id === id ? { ...item, status, note } : item)));
      },
      setPatient: (id, patch) => {
        setPatients((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
      },
      setCaseStatus: (id, status) => {
        setCases((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
      },
      saveSettings: setSettings,
    }),
    [cases, dossiers, patients, settings],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin debe usarse dentro del panel");
  return value;
}
