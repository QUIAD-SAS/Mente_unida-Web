import { adminJson } from "@/lib/admin/api/admin-fetch";
import type {
  ModerationActionPayload,
  ModerationDetail,
  ModerationFilters,
  ModerationResponse,
} from "./types";

function buildQuery(filters?: ModerationFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.reason && filters.reason !== "all") {
    params.set("reason", filters.reason);
  }
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.aiOnly) {
    params.set("aiOnly", "true");
  }
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchModerationItems(
  filters?: ModerationFilters,
): Promise<ModerationResponse> {
  return adminJson<ModerationResponse>(`/moderacion${buildQuery(filters)}`);
}

export async function fetchModerationItem(id: string): Promise<ModerationDetail> {
  return adminJson<ModerationDetail>(`/moderacion/${id}`);
}

export async function submitModerationAction(
  id: string,
  payload: ModerationActionPayload,
): Promise<{ ok: boolean }> {
  return adminJson<{ ok: boolean }>(`/moderacion/${id}/actions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
