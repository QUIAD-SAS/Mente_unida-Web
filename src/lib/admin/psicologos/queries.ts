import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPsychologist,
  fetchPsychologists,
  submitPsychologistAction,
  updatePsychologist,
} from "./api";
import type {
  PsychologistActionPayload,
  PsychologistFilters,
  PsychologistUpdatePayload,
} from "./types";

export const psicologosKeys = {
  all: ["psicologos"] as const,
  list: (filters?: PsychologistFilters) =>
    [...psicologosKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...psicologosKeys.all, "detail", id] as const,
};

export function usePsychologists(filters?: PsychologistFilters) {
  return useQuery({
    queryKey: psicologosKeys.list(filters),
    queryFn: () => fetchPsychologists(filters),
    staleTime: 30_000,
  });
}

export function usePsychologist(id: string | null) {
  return useQuery({
    queryKey: psicologosKeys.detail(id ?? ""),
    queryFn: () => fetchPsychologist(id!),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}

export function useUpdatePsychologist(id: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PsychologistUpdatePayload) => {
      if (!id) throw new Error("Psicólogo no seleccionado");
      return updatePsychologist(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: psicologosKeys.all });
    },
  });
}

export function usePsychologistAction(id: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PsychologistActionPayload) => {
      if (!id) throw new Error("Psicólogo no seleccionado");
      return submitPsychologistAction(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: psicologosKeys.all });
    },
  });
}
