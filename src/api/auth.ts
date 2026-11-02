import { api } from "./client";
import type { AuthSession, PatientProfile, ProfileCompletion, PsychologistAccess, SessionUser } from "./types";

export type RegisterPatientInput = {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  documentType?: "CC" | "CE" | "PASSPORT" | "TI" | "OTHER";
  documentNumber?: string;
  birthDate?: string;
  phone?: string;
  country?: string;
  department?: string;
  city?: string;
  addressLine?: string;
  emergencyContactDetail?: {
    name: string;
    phone: string;
    relationship: string;
    email?: string;
  };
};

export type RegisterPsychologistInput = {
  name: string;
  email: string;
  password: string;
  licenseNumber: string;
  acceptTerms: boolean;
  phone?: string;
  country?: string;
  department?: string;
  city?: string;
  addressLine?: string;
};

const publicCall = { auth: false as const };

export function registerPatient(input: RegisterPatientInput) {
  return api<AuthSession>("/auth/register/patient", { body: input, ...publicCall });
}

export function registerPsychologist(input: RegisterPsychologistInput) {
  return api<AuthSession>("/auth/register/psychologist", { body: input, ...publicCall });
}

export function login(input: { email: string; password: string }) {
  return api<AuthSession>("/auth/login", { body: input, ...publicCall });
}

export function logout() {
  return api<unknown>("/auth/logout", { body: {} });
}

export function forgotPassword(email: string) {
  return api<unknown>("/auth/forgot-password", { body: { email }, ...publicCall });
}

export function resetPassword(input: { token: string; password: string; confirmPassword: string }) {
  return api<unknown>("/auth/reset-password", { body: input, ...publicCall });
}

export function verifyEmail(token: string) {
  return api<unknown>("/auth/verify-email", { body: { token }, ...publicCall });
}

export function resendVerification(email: string) {
  return api<unknown>("/auth/resend-verification", { body: { email }, ...publicCall });
}

export function fetchMe() {
  return api<SessionUser>("/auth/me");
}

export function fetchMyPatient() {
  return api<PatientProfile>("/patients/me", { context: "PATIENT" });
}

export function fetchMyCompletion() {
  return api<ProfileCompletion>("/patients/me/completion", { context: "PATIENT" });
}

export function fetchPsychologistAccess() {
  return api<PsychologistAccess>("/psychologists/access-check", { context: "PSYCHOLOGIST" });
}

export function uploadVerificationDocument(file: File, type: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("type", type);
  return api<unknown>("/psychologists/me/documents", { form, context: "PSYCHOLOGIST" });
}
