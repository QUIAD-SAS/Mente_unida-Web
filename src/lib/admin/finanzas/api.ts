import { adminFetch, adminJson } from "@/lib/admin/api/admin-fetch";
import type { FinanzasData, FinanzasFilters } from "./types";

function buildQuery(filters?: FinanzasFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchFinanzasData(
  filters?: FinanzasFilters,
): Promise<FinanzasData> {
  return adminJson<FinanzasData>(`/finanzas${buildQuery(filters)}`);
}

export async function downloadFinanzasReport(
  filters?: FinanzasFilters,
): Promise<Blob> {
  const res = await adminFetch(`/finanzas/report${buildQuery(filters)}`);
  if (!res.ok) {
    throw new Error("No se pudo generar el reporte PDF");
  }
  return res.blob();
}
