export type SolicitudStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "rejected"
  | "info_requested"
  | "supervisor_required";

export interface SolicitudListItem {
  id: string;
  name: string;
  submittedAt: string;
  status: SolicitudStatus;
  experienceYears: number;
  experienceLabel?: string;
  documentsCount: number;
}

export interface SolicitudDocument {
  id: string;
  name: string;
  url: string;
  type:
    | "rethus"
    | "license"
    | "specialization"
    | "identity"
    | "certificate"
    | "other";
  rawType?: string;
}

export interface SolicitudWorkExperience {
  id: string;
  companyName: string;
  roleTitle: string;
  startDate: string;
  endDate: string | null;
  durationLabel: string;
}

export interface SolicitudDetail {
  request: SolicitudListItem & {
    email: string;
    specialty: string;
    specialtyCodes?: string[];
    license: string;
    phone: string;
    bio: string;
    city: string;
    department?: string;
    country: string;
    addressLine?: string;
    experienceLabel?: string;
    workExperiences?: SolicitudWorkExperience[];
  };
  documents: SolicitudDocument[];
}

export interface SolicitudesResponse {
  requests: SolicitudListItem[];
}

export interface SolicitudFilters {
  status?: SolicitudStatus | "all";
  search?: string;
}

export type SolicitudActionType =
  | "approve"
  | "reject"
  | "request_info"
  | "require_supervisor";

export interface SolicitudActionPayload {
  type: SolicitudActionType;
  message?: string;
}
