export type AccessContext = "PATIENT" | "PSYCHOLOGIST" | "ADMIN";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  imageUrl: string | null;
  roles: string[];
  accessContext: AccessContext;
  permissions: string[];
  isActive: boolean;
  emailVerified: boolean;
  patient: { id: string; alias: string } | null;
  psychologist: {
    id: string;
    verificationStatus: string;
    professionalAccess: boolean;
  } | null;
};

export type AuthSession = {
  accessToken: string;
  user: SessionUser;
};

export type PatientProfile = {
  id: string;
  alias: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  documentNumber: string | null;
  birthDate: string | null;
};

export type ProfileCompletion = {
  complete: boolean;
  missing: string[];
};

export type PsychologistAccess = {
  authenticated: boolean;
  hasPsychologistRole: boolean;
  verificationStatus: string;
  approved: boolean;
  professionalAccess: boolean;
};
