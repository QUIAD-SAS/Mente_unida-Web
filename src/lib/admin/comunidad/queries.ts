import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCommunityPost,
  fetchCommunityPosts,
  submitCommunityAction,
} from "./api";
import type { CommunityActionPayload, CommunityFilters } from "./types";

export const comunidadKeys = {
  all: ["comunidad"] as const,
  list: (filters?: CommunityFilters) =>
    [...comunidadKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...comunidadKeys.all, "detail", id] as const,
};

export function useCommunityPosts(filters?: CommunityFilters) {
  return useQuery({
    queryKey: comunidadKeys.list(filters),
    queryFn: () => fetchCommunityPosts(filters),
    staleTime: 30_000,
  });
}

export function useCommunityPost(id: string | null) {
  return useQuery({
    queryKey: comunidadKeys.detail(id ?? ""),
    queryFn: () => fetchCommunityPost(id!),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}

export function useCommunityAction(id: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CommunityActionPayload) => {
      if (!id) throw new Error("Publicación no seleccionada");
      return submitCommunityAction(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: comunidadKeys.all });
    },
  });
}
