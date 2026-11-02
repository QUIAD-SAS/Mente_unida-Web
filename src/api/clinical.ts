import { api } from "./client";

export type PsychAppointment = {
  id: string;
  status: string;
  modality: "ONLINE" | "IN_PERSON" | string;
  startAt: string;
  endAt: string;
  patient: { id: string; alias: string; name: string };
};

export type ClinicalRecord = {
  id: string;
  patientId: string;
  status: string;
  consultationReason: string | null;
  antecedents: string | null;
  initialEvaluation: string | null;
  therapeuticGoals: string | null;
  openedAt: string;
  closedAt: string | null;
  professional: { id: string; name: string };
  appointments: { id: string; status: string; startAt: string; endAt: string }[];
};

export type ClinicalNote = {
  id: string;
  appointmentId: string;
  clinicalRecordId: string | null;
  attendedAt: string;
  observations: string;
  evolution: string;
  interventions: string | null;
  recommendations: string | null;
  nextObjectives: string | null;
  riskNotes: string;
  createdAt: string;
  updatedAt: string;
};

export function fetchPsychAppointments(view: "upcoming" | "history" | "requests") {
  return api<{ items: PsychAppointment[] }>("/psychologists/me/appointments", {
    context: "PSYCHOLOGIST",
    query: { view },
  });
}

export function fetchClinicalRecord(patientId: string) {
  return api<ClinicalRecord>(`/clinical-records/${patientId}`, { context: "PSYCHOLOGIST" });
}

export function fetchClinicalNotes(patientId: string) {
  return api<{ items: ClinicalNote[] }>(`/patients/${patientId}/clinical-notes`, { context: "PSYCHOLOGIST" });
}
