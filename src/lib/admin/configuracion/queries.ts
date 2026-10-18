import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchConfig, updateConfig } from "./api";
import type { ConfigUpdatePayload } from "./types";

export const configuracionKeys = {
  all: ["configuracion"] as const,
};

export function useConfig() {
  return useQuery({
    queryKey: configuracionKeys.all,
    queryFn: fetchConfig,
    staleTime: 60_000,
  });
}

export function useConfigUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConfigUpdatePayload) => updateConfig(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: configuracionKeys.all });
    },
  });
}
