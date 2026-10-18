import { adminJson } from "@/lib/admin/api/admin-fetch";
import type {
  EscuchaderoActionPayload,
  EscuchaderoFilters,
  EscuchaderoMessageDetail,
  EscuchaderoMessagesResponse,
  EscuchaderoUnreadSummary,
} from "./types";

function buildQuery(filters?: EscuchaderoFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.priority && filters.priority !== "all") {
    params.set("priority", filters.priority);
  }
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchEscuchaderoMessages(
  filters?: EscuchaderoFilters,
): Promise<EscuchaderoMessagesResponse> {
  return adminJson<EscuchaderoMessagesResponse>(
    `/escuchadero/messages${buildQuery(filters)}`,
  );
}

export async function fetchEscuchaderoMessage(
  id: string,
): Promise<EscuchaderoMessageDetail> {
  return adminJson<EscuchaderoMessageDetail>(`/escuchadero/messages/${id}`);
}

export async function fetchEscuchaderoUnreadSummary(): Promise<EscuchaderoUnreadSummary> {
  return adminJson<EscuchaderoUnreadSummary>(
    `/escuchadero/messages/unread-summary`,
  );
}

export async function submitEscuchaderoAction(
  id: string,
  payload: EscuchaderoActionPayload,
): Promise<{ ok: boolean }> {
  return adminJson<{ ok: boolean }>(`/escuchadero/messages/${id}/actions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type ClinicalAction =
  | { kind: "risk"; level: number; notes?: string }
  | { kind: "follow-up"; notes?: string; dueAt?: string; assignedToId?: string }
  | { kind: "clinical-support"; reason: string; notes?: string }
  | { kind: "emergency"; type: string; severity: string; message: string; confirmed: true }
  | { kind: "identity-request"; reason: string };

export async function submitClinicalAction(
  id: string,
  action: ClinicalAction,
): Promise<unknown> {
  const { kind, ...body } = action;
  const path =
    kind === "risk"
      ? "risk"
      : kind === "follow-up"
        ? "follow-up"
        : kind === "clinical-support"
          ? "clinical-support"
          : kind === "emergency"
            ? "emergency"
            : "identity-request";
  return adminJson(`/escuchadero/sessions/${id}/${path}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
