import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSoporteConversation,
  fetchSoporteConversations,
  sendSoporteMessage,
  submitSoporteAction,
} from "./api";
import type {
  SoporteActionPayload,
  SoporteFilters,
  SoporteSendMessagePayload,
} from "./types";

export const soporteKeys = {
  all: ["soporte"] as const,
  list: (filters?: SoporteFilters) =>
    [...soporteKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...soporteKeys.all, "detail", id] as const,
};

export function useSoporteConversations(filters?: SoporteFilters) {
  return useQuery({
    queryKey: soporteKeys.list(filters),
    queryFn: () => fetchSoporteConversations(filters),
    staleTime: 15_000,
  });
}

export function useSoporteConversation(id: string | null) {
  return useQuery({
    queryKey: soporteKeys.detail(id ?? ""),
    queryFn: () => fetchSoporteConversation(id!),
    enabled: Boolean(id),
    staleTime: 10_000,
  });
}

export function useSendSoporteMessage(id: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SoporteSendMessagePayload) => {
      if (!id) throw new Error("Conversación no seleccionada");
      return sendSoporteMessage(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: soporteKeys.all });
    },
  });
}

export function useSoporteAction(id: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SoporteActionPayload) => {
      if (!id) throw new Error("Conversación no seleccionada");
      return submitSoporteAction(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: soporteKeys.all });
    },
  });
}
