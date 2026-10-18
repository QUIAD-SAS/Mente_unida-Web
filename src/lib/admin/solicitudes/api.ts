import { adminJson } from "@/lib/admin/api/admin-fetch";
import type {
  SolicitudActionPayload,
  SolicitudDetail,
  SolicitudFilters,
  SolicitudesResponse,
} from "./types";

function buildQuery(filters?: SolicitudFilters): string {
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

export async function fetchSolicitudes(
  filters?: SolicitudFilters,
): Promise<SolicitudesResponse> {
  return adminJson<SolicitudesResponse>(`/solicitudes${buildQuery(filters)}`);
}

export async function fetchSolicitud(id: string): Promise<SolicitudDetail> {
  return adminJson<SolicitudDetail>(`/solicitudes/${id}`);
}

export async function submitSolicitudAction(
  id: string,
  payload: SolicitudActionPayload,
): Promise<{ ok: boolean }> {
  return adminJson<{ ok: boolean }>(`/solicitudes/${id}/actions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
