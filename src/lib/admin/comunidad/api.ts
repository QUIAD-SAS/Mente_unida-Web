import { adminJson } from "@/lib/admin/api/admin-fetch";
import type {
  CommunityActionPayload,
  CommunityFilters,
  CommunityPostDetail,
  CommunityPostsResponse,
} from "./types";

function buildQuery(filters?: CommunityFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.type && filters.type !== "all") {
    params.set("type", filters.type);
  }
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchCommunityPosts(
  filters?: CommunityFilters,
): Promise<CommunityPostsResponse> {
  return adminJson<CommunityPostsResponse>(
    `/comunidad/posts${buildQuery(filters)}`,
  );
}

export async function fetchCommunityPost(id: string): Promise<CommunityPostDetail> {
  return adminJson<CommunityPostDetail>(`/comunidad/posts/${id}`);
}

export async function submitCommunityAction(
  id: string,
  payload: CommunityActionPayload,
): Promise<{ ok: boolean }> {
  return adminJson<{ ok: boolean }>(`/comunidad/posts/${id}/actions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
