import { useQuery } from "@tanstack/react-query";
import { fetchFinanzasData } from "./api";
import type { FinanzasFilters } from "./types";

export const finanzasKeys = {
  all: ["finanzas"] as const,
  data: (filters?: FinanzasFilters) =>
    [...finanzasKeys.all, "data", filters ?? {}] as const,
};

export function useFinanzasData(filters?: FinanzasFilters) {
  return useQuery({
    queryKey: finanzasKeys.data(filters),
    queryFn: () => fetchFinanzasData(filters),
    staleTime: 60_000,
  });
}
