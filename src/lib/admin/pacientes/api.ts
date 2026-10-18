import { adminJson } from "@/lib/admin/api/admin-fetch";
import type {
  PatientActionPayload,
  PatientDetail,
  PatientFilters,
  PatientsResponse,
  PatientUpdatePayload,
} from "./types";

function buildQuery(filters?: PatientFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchPatients(
  filters?: PatientFilters,
): Promise<PatientsResponse> {
  return adminJson<PatientsResponse>(`/pacientes${buildQuery(filters)}`);
}

export async function fetchPatient(id: string): Promise<PatientDetail> {
  return adminJson<PatientDetail>(`/pacientes/${id}`);
}

export async function updatePatient(
  id: string,
  payload: PatientUpdatePayload,
): Promise<{ ok: boolean }> {
  return adminJson<{ ok: boolean }>(`/pacientes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function submitPatientAction(
  id: string,
  payload: PatientActionPayload,
): Promise<{ ok: boolean }> {
  return adminJson<{ ok: boolean }>(`/pacientes/${id}/actions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
