import { adminJson } from "@/lib/admin/api/admin-fetch";
import type {
  PsychologistActionPayload,
  PsychologistDetail,
  PsychologistFilters,
  PsychologistsResponse,
  PsychologistUpdatePayload,
} from "./types";

function buildQuery(filters?: PsychologistFilters): string {
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

export async function fetchPsychologists(
  filters?: PsychologistFilters,
): Promise<PsychologistsResponse> {
  return adminJson<PsychologistsResponse>(`/psicologos${buildQuery(filters)}`);
}

export async function fetchPsychologist(id: string): Promise<PsychologistDetail> {
  return adminJson<PsychologistDetail>(`/psicologos/${id}`);
}

export async function updatePsychologist(
  id: string,
  payload: PsychologistUpdatePayload,
): Promise<{ ok: boolean }> {
  return adminJson<{ ok: boolean }>(`/psicologos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function submitPsychologistAction(
  id: string,
  payload: PsychologistActionPayload,
): Promise<{ ok: boolean }> {
  return adminJson<{ ok: boolean }>(`/psicologos/${id}/actions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
