import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSolicitud,
  fetchSolicitudes,
  submitSolicitudAction,
} from "./api";
import type { SolicitudActionPayload, SolicitudFilters } from "./types";

export const solicitudesKeys = {
  all: ["solicitudes"] as const,
  list: (filters?: SolicitudFilters) =>
    [...solicitudesKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...solicitudesKeys.all, "detail", id] as const,
};

export function useSolicitudes(filters?: SolicitudFilters) {
  return useQuery({
    queryKey: solicitudesKeys.list(filters),
    queryFn: () => fetchSolicitudes(filters),
    staleTime: 30_000,
  });
}

export function useSolicitud(id: string | null) {
  return useQuery({
    queryKey: solicitudesKeys.detail(id ?? ""),
    queryFn: () => fetchSolicitud(id!),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}

export function useSolicitudAction(id: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SolicitudActionPayload) => {
      if (!id) throw new Error("Solicitud no seleccionada");
      return submitSolicitudAction(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: solicitudesKeys.all });
      await queryClient.invalidateQueries({ queryKey: ["psicologos"] });
    },
  });
}
