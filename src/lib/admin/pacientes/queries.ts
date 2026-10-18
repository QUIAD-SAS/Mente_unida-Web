import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPatient,
  fetchPatients,
  submitPatientAction,
  updatePatient,
} from "./api";
import type {
  PatientActionPayload,
  PatientFilters,
  PatientUpdatePayload,
} from "./types";

export const pacientesKeys = {
  all: ["pacientes"] as const,
  list: (filters?: PatientFilters) =>
    [...pacientesKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...pacientesKeys.all, "detail", id] as const,
};

export function usePatients(filters?: PatientFilters) {
  return useQuery({
    queryKey: pacientesKeys.list(filters),
    queryFn: () => fetchPatients(filters),
    staleTime: 30_000,
  });
}

export function usePatient(id: string | null) {
  return useQuery({
    queryKey: pacientesKeys.detail(id ?? ""),
    queryFn: () => fetchPatient(id!),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}

export function useUpdatePatient(id: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatientUpdatePayload) => {
      if (!id) throw new Error("Paciente no seleccionado");
      return updatePatient(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pacientesKeys.all });
    },
  });
}

export function usePatientAction(id: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatientActionPayload) => {
      if (!id) throw new Error("Paciente no seleccionado");
      return submitPatientAction(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pacientesKeys.all });
    },
  });
}
