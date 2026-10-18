import type {
  CommunityPost,
  DirectoryListResponse,
  PaginatedMeta,
  SubscriptionPlan,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function fetchPublicApi<T>(
  path: string,
  revalidate = 60,
): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1${path}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate },
    });
    if (!res.ok) return null;
    const payload = await res.json();
    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      "data" in payload
    ) {
      return payload.data as T;
    }
    return payload as T;
  } catch {
    return null;
  }
}

export function fetchDirectory(params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  return fetchPublicApi<DirectoryListResponse>(`/directory/psychologists${qs}`);
}

export function fetchDirectoryPsychologist(slug: string) {
  return fetchPublicApi<DirectoryListResponse["items"][0] & { bio?: string }>(
    `/directory/psychologists/${slug}`,
  );
}

export function fetchCommunityPosts(params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  return fetchPublicApi<{ items: CommunityPost[]; meta: PaginatedMeta }>(
    `/community/posts${qs}`,
  );
}

export function fetchSubscriptionPlans() {
  return fetchPublicApi<SubscriptionPlan[]>("/subscriptions/plans");
}
