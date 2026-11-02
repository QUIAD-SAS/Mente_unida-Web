import { clearSession, readSession, writeAccessToken } from "./session";
import type { AccessContext } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api/v1").replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: string[];

  constructor(status: number, code: string, message: string, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  form?: FormData;
  query?: Record<string, string | number | boolean | undefined>;
  auth?: boolean;
  context?: AccessContext;
  retried?: boolean;
};

type ErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: string[];
  };
};

let refreshing: Promise<string | null> | null = null;
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

export function apiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const details = error.details?.filter(Boolean).join(". ");
    return details ? `${error.message}. ${details}` : error.message;
  }
  return fallback;
}

export function apiBase() {
  return API_BASE;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? (options.body !== undefined || options.form ? "POST" : "GET");
  const headers = new Headers({ Accept: "application/json" });

  if (!options.form && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const session = readSession();
    if (session.accessToken) headers.set("Authorization", `Bearer ${session.accessToken}`);
    const context = options.context ?? session.accessContext;
    if (context) headers.set("x-access-context", context);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      credentials: "include",
      body: options.form ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
    });
  } catch {
    throw new ApiError(0, "NETWORK", "No pudimos conectar con el servidor. Revisa que el API esté en marcha.");
  }

  if (response.status === 401 && options.auth !== false && !options.retried) {
    const nextToken = await refreshAccessToken();
    if (nextToken) return api<T>(path, { ...options, retried: true });
    clearSession();
    onSessionExpired?.();
    throw new ApiError(401, "UNAUTHORIZED", "La sesión expiró. Vuelve a iniciar sesión.");
  }

  const payload = await readPayload(response);
  if (!response.ok) throw toError(response.status, payload);
  return unwrap<T>(payload);
}

async function refreshAccessToken() {
  if (!refreshing) {
    const context = readSession().accessContext;
    refreshing = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(context ? { "x-access-context": context } : {}),
      },
      body: "{}",
    })
      .then(async (response) => {
        const payload = await readPayload(response);
        if (!response.ok) return null;
        const data = unwrap<{ accessToken?: string }>(payload);
        if (!data.accessToken) return null;
        writeAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function readPayload(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(response.status, "INTERNAL_ERROR", "El servidor respondió con un formato que no pudimos leer.");
  }
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload && (payload as { success: unknown }).success === true) {
    return (payload as { data: T }).data;
  }
  throw new ApiError(500, "INTERNAL_ERROR", "La respuesta del servidor no tiene el formato esperado.");
}

function toError(status: number, payload: unknown) {
  const error = payload && typeof payload === "object" && "error" in payload ? (payload as ErrorBody).error : undefined;
  return new ApiError(status, error?.code ?? "INTERNAL_ERROR", error?.message ?? "No pudimos completar la solicitud.", error?.details);
}
