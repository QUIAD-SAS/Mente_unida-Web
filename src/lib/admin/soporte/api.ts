import { adminJson } from "@/lib/admin/api/admin-fetch";
import type {
  SoporteActionPayload,
  SoporteConversationDetail,
  SoporteConversationsResponse,
  SoporteFilters,
  SoporteSendMessagePayload,
} from "./types";

function buildQuery(filters?: SoporteFilters): string {
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

export async function fetchSoporteConversations(
  filters?: SoporteFilters,
): Promise<SoporteConversationsResponse> {
  return adminJson<SoporteConversationsResponse>(
    `/soporte/conversations${buildQuery(filters)}`,
  );
}

export async function fetchSoporteConversation(
  id: string,
): Promise<SoporteConversationDetail> {
  return adminJson<SoporteConversationDetail>(`/soporte/conversations/${id}`);
}

export async function sendSoporteMessage(
  id: string,
  payload: SoporteSendMessagePayload,
): Promise<{ ok: boolean }> {
  return adminJson<{ ok: boolean }>(`/soporte/conversations/${id}/messages`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function submitSoporteAction(
  id: string,
  payload: SoporteActionPayload,
): Promise<{ ok: boolean }> {
  return adminJson<{ ok: boolean }>(`/soporte/conversations/${id}/actions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
