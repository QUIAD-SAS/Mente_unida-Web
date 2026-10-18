import { useQuery } from "@tanstack/react-query";
import { fetchAuditLog, fetchAuditLogs } from "./api";
import type { AuditFilters } from "./types";

export const auditoriaKeys = {
  all: ["auditoria"] as const,
  list: (filters?: AuditFilters) =>
    [...auditoriaKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...auditoriaKeys.all, "detail", id] as const,
};

export function useAuditLogs(filters?: AuditFilters) {
  return useQuery({
    queryKey: auditoriaKeys.list(filters),
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 30_000,
  });
}

export function useAuditLog(id: string | null) {
  return useQuery({
    queryKey: auditoriaKeys.detail(id ?? ""),
    queryFn: () => fetchAuditLog(id!),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}
