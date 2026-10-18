import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchModerationItem,
  fetchModerationItems,
  submitModerationAction,
} from "./api";
import type { ModerationActionPayload, ModerationFilters } from "./types";

export const moderacionKeys = {
  all: ["moderacion"] as const,
  list: (filters?: ModerationFilters) =>
    [...moderacionKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...moderacionKeys.all, "detail", id] as const,
};

export function useModerationItems(filters?: ModerationFilters) {
  return useQuery({
    queryKey: moderacionKeys.list(filters),
    queryFn: () => fetchModerationItems(filters),
    staleTime: 30_000,
  });
}

export function useModerationItem(id: string | null) {
  return useQuery({
    queryKey: moderacionKeys.detail(id ?? ""),
    queryFn: () => fetchModerationItem(id!),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}

export function useModerationAction(id: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ModerationActionPayload) => {
      if (!id) throw new Error("Caso no seleccionado");
      return submitModerationAction(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: moderacionKeys.all });
    },
  });
}
