import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchIaAdministrativa,
  fetchIaAlert,
  submitIaAction,
} from "./api";
import type { IaActionPayload, IaFilters } from "./types";

export const iaAdminKeys = {
  all: ["ia-administrativa"] as const,
  list: (filters?: IaFilters) =>
    [...iaAdminKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...iaAdminKeys.all, "detail", id] as const,
};

export function useIaAdministrativa(filters?: IaFilters) {
  return useQuery({
    queryKey: iaAdminKeys.list(filters),
    queryFn: () => fetchIaAdministrativa(filters),
    staleTime: 30_000,
  });
}

export function useIaAlert(id: string | null) {
  return useQuery({
    queryKey: iaAdminKeys.detail(id ?? ""),
    queryFn: () => fetchIaAlert(id!),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}

export function useIaAction(id: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IaActionPayload) => {
      if (!id) throw new Error("Alerta no seleccionada");
      return submitIaAction(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: iaAdminKeys.all });
    },
  });
}
