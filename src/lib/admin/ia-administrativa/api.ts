import { adminJson } from "@/lib/admin/api/admin-fetch";
import type {
  IaActionPayload,
  IaAdministrativaData,
  IaAlertDetail,
  IaFilters,
} from "./types";

function buildQuery(filters?: IaFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.type && filters.type !== "all") {
    params.set("type", filters.type);
  }
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchIaAdministrativa(
  filters?: IaFilters,
): Promise<IaAdministrativaData> {
  return adminJson<IaAdministrativaData>(
    `/ia-administrativa${buildQuery(filters)}`,
  );
}

export async function fetchIaAlert(id: string): Promise<IaAlertDetail> {
  return adminJson<IaAlertDetail>(`/ia-administrativa/${id}`);
}

export async function submitIaAction(
  id: string,
  payload: IaActionPayload,
): Promise<{ ok: boolean }> {
  return adminJson<{ ok: boolean }>(`/ia-administrativa/${id}/actions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
