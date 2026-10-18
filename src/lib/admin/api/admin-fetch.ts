import { useAuthStore } from "@/lib/auth/store";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ApiEnvelope<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

function unwrapApiResponse<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

function parseErrorMessage(data: unknown, status: number): string {
  if (!data || typeof data !== "object") return `Error ${status}`;
  const d = data as {
    message?: string | string[];
    errors?: string[];
  };
  if (Array.isArray(d.errors) && d.errors.length > 0) return d.errors.join(", ");
  if (Array.isArray(d.message)) return d.message.join(", ");
  if (typeof d.message === "string" && d.message.length > 0) return d.message;
  return `Error ${status}`;
}

/** Prefijo de rutas admin en la API unificada: /api/v1/admin/... */
export function getAdminApiBase(): string {
  return `${API_BASE}/api/v1/admin`;
}

export async function adminFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const token =
    typeof window !== "undefined" ? useAuthStore.getState().token : null;

  return fetch(`${getAdminApiBase()}${normalized}`, {
    ...init,
    cache: init?.cache ?? "no-store",
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}

export async function adminJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await adminFetch(path, init);
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(parseErrorMessage(payload, res.status));
  }

  return unwrapApiResponse<T>(payload);
}
