import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchEscuchaderoMessage,
  fetchEscuchaderoMessages,
  fetchEscuchaderoUnreadSummary,
  submitClinicalAction,
  submitEscuchaderoAction,
} from "./api";
import type { EscuchaderoActionPayload, EscuchaderoFilters } from "./types";
import type { ClinicalAction } from "./api";

export const escuchaderoKeys = {
  all: ["escuchadero"] as const,
  list: (filters?: EscuchaderoFilters) =>
    [...escuchaderoKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...escuchaderoKeys.all, "detail", id] as const,
  unread: [...(["escuchadero", "unread"] as const)] as const,
};

export function useEscuchaderoMessages(
  filters?: EscuchaderoFilters,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: escuchaderoKeys.list(filters),
    queryFn: () => fetchEscuchaderoMessages(filters),
    staleTime: 8_000,
    refetchInterval: options?.refetchInterval ?? 15_000,
    retry: (failureCount, error) => {
      if (error instanceof Error && /429|Demasiadas/.test(error.message)) {
        return failureCount < 1;
      }
      return failureCount < 2;
    },
  });
}

export function useEscuchaderoMessage(
  id: string | null,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: escuchaderoKeys.detail(id ?? ""),
    queryFn: () => fetchEscuchaderoMessage(id!),
    enabled: Boolean(id),
    staleTime: 5_000,
    refetchInterval: options?.refetchInterval ?? false,
    retry: (failureCount, error) => {
      if (error instanceof Error && /429|Demasiadas/.test(error.message)) {
        return failureCount < 1;
      }
      return failureCount < 2;
    },
  });
}

export function useEscuchaderoUnreadSummary() {
  return useQuery({
    queryKey: escuchaderoKeys.unread,
    queryFn: fetchEscuchaderoUnreadSummary,
    staleTime: 10_000,
    refetchInterval: 20_000,
    retry: (failureCount, error) => {
      if (error instanceof Error && /429|Demasiadas/.test(error.message)) {
        return failureCount < 1;
      }
      return failureCount < 2;
    },
  });
}

export function useEscuchaderoAction(id: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EscuchaderoActionPayload) => {
      if (!id) throw new Error("Conversación no seleccionada");
      return submitEscuchaderoAction(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: escuchaderoKeys.all });
    },
  });
}

export function useEscuchaderoClinicalAction(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: ClinicalAction) => {
      if (!id) throw new Error("Conversación no seleccionada");
      return submitClinicalAction(id, action);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: escuchaderoKeys.all });
    },
  });
}
