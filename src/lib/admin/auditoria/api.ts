import { adminJson } from "@/lib/admin/api/admin-fetch";
import type { AuditFilters, AuditLogDetail, AuditResponse } from "./types";

function buildQuery(filters?: AuditFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.user) params.set("user", filters.user);
  if (filters.module && filters.module !== "all") {
    params.set("module", filters.module);
  }
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.search) params.set("search", filters.search);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchAuditLogs(
  filters?: AuditFilters,
): Promise<AuditResponse> {
  return adminJson<AuditResponse>(`/auditoria${buildQuery(filters)}`);
}

export async function fetchAuditLog(id: string): Promise<AuditLogDetail> {
  return adminJson<AuditLogDetail>(`/auditoria/${id}`);
}
