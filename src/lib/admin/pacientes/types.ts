export type PatientStatus = "active" | "suspended" | "pending";

export interface PatientListItem {
  id: string;
  alias: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  status: PatientStatus;
  registeredAt: string;
}

export interface PatientAppointment {
  id: string;
  psychologistName: string;
  date: string;
  status: string;
}

export interface PatientSubscription {
  plan: string;
  status: string;
  startDate: string;
  endDate?: string;
}

export interface PatientPayment {
  id: string;
  amount: number;
  date: string;
  status: string;
}

export interface PatientNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface PatientAuditEntry {
  id: string;
  action: string;
  performedBy: string;
  createdAt: string;
}

export interface PatientDetail {
  patient: PatientListItem;
  appointments: PatientAppointment[];
  subscription: PatientSubscription | null;
  payments: PatientPayment[];
  notes: PatientNote[];
  audit: PatientAuditEntry[];
}

export interface PatientsResponse {
  patients: PatientListItem[];
}

export interface PatientFilters {
  status?: PatientStatus | "all";
  search?: string;
}

export type PatientActionType =
  | "suspend"
  | "activate"
  | "change_password"
  | "add_note";

export interface PatientActionPayload {
  type: PatientActionType;
  password?: string;
  note?: string;
}

export interface PatientUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  emergencyContact?: string;
  isActive?: boolean;
}

export type PatientDetailTab =
  | "info"
  | "appointments"
  | "subscription"
  | "payments"
  | "notes"
  | "audit";
