export type PsychologistStatus =
  | "pending"
  | "approved"
  | "supervisor"
  | "rejected";

export type PsychologistPlan = "basic" | "professional" | "premium" | "none";

export interface PsychologistListItem {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  license: string;
  status: PsychologistStatus;
  plan: PsychologistPlan;
  isActive: boolean;
}

export interface PsychologistDocument {
  id: string;
  name: string;
  url: string;
  type: "rethus" | "license" | "specialization" | "other";
}

export interface PsychologistWorkExperience {
  id: string;
  companyName: string;
  roleTitle: string;
  startDate: string;
  endDate: string | null;
  durationLabel: string;
}

export interface PsychologistProfile extends PsychologistListItem {
  slug: string;
  email: string;
  phone: string;
  bio: string;
  specialties: string[];
  city: string;
  department?: string;
  country: string;
  addressLine?: string;
  languages: string[];
  priceCents: number;
  currency: string;
  modalityOnline: boolean;
  modalityInPerson: boolean;
  experienceLabel?: string;
  workExperiences?: PsychologistWorkExperience[];
}

export interface PsychologistSession {
  id: string;
  patientAlias: string;
  date: string;
  status: string;
}

export interface PsychologistIncome {
  id: string;
  period: string;
  amount: number;
  status: string;
}

export interface PsychologistSupervision {
  id: string;
  supervisorName: string;
  date: string;
  status: string;
}

export interface PsychologistDetail {
  psychologist: PsychologistProfile;
  documents: PsychologistDocument[];
  sessions: PsychologistSession[];
  income: PsychologistIncome[];
  supervisions: PsychologistSupervision[];
}

export interface PsychologistsResponse {
  psychologists: PsychologistListItem[];
}

export interface PsychologistFilters {
  status?: PsychologistStatus | "all";
  search?: string;
}

export type PsychologistActionType = "change_password";

export interface PsychologistActionPayload {
  type: PsychologistActionType;
  password?: string;
}

export interface PsychologistUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  specialties?: string[];
  bio?: string;
  city?: string;
  country?: string;
  languages?: string[];
  priceCents?: number;
  modalityOnline?: boolean;
  modalityInPerson?: boolean;
  isActive?: boolean;
}

export type PsychologistDetailTab =
  | "rethus"
  | "tarjeta"
  | "especializaciones"
  | "experience"
  | "specialties"
  | "sessions"
  | "income";
