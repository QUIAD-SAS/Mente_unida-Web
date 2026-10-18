"use client";

import { Button } from "@/components/ui/button";
import { api, ApiError, normalizeAuthUser } from "@/lib/api-client";
import { getDashboardPath, useAuthStore } from "@/lib/auth/store";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const res = await api.auth.login({ email, password });
      const user = normalizeAuthUser(res.user);
      setSession(res.accessToken, user, res.refreshToken);
      const next = searchParams.get("next");
      router.push(next ?? getDashboardPath(user.roles ?? [user.role]));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No pudimos iniciar sesión",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {error ? (
          <p
            className="rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-11 w-full rounded-mu border border-mu-border px-3"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="h-11 w-full rounded-mu border border-mu-border px-3 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-mu-text-muted hover:bg-mu-accent hover:text-mu-text"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-mu-text-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-mu-primary hover:underline">
          Regístrate
        </Link>
      </p>
    </>
  );
}
