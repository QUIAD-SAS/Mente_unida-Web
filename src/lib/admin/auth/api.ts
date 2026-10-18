import type { AuthError, AuthLoginResponse } from "./types";

export class AuthApiError extends Error {
  constructor(
    public readonly code: AuthError["code"],
    message: string,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

export async function loginRequest(payload: {
  username: string;
  password: string;
  rememberMe: boolean;
}): Promise<AuthLoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as AuthLoginResponse | AuthError;

  if (!res.ok) {
    const error = data as AuthError;
    throw new AuthApiError(
      error.code ?? "unknown",
      error.message ?? "No pudimos verificar tu acceso",
    );
  }

  return data as AuthLoginResponse;
}
