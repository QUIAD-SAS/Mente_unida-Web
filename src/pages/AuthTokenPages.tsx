import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword, verifyEmail } from "../api/auth";
import { apiErrorMessage } from "../api/client";
import { passwordIssue } from "../auth/password";
import { Logo } from "../components/Logo";
import { fieldClass } from "../components/ui";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [message, setMessage] = useState(token ? "Confirmando tu correo…" : "El enlace no trae un token de verificación.");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    verifyEmail(token)
      .then(() => {
        if (cancelled) return;
        setOk(true);
        setMessage("Tu correo quedó verificado. Ya puedes entrar con tu cuenta.");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setOk(false);
        setMessage(apiErrorMessage(error, "No pudimos verificar el correo."));
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <TokenLayout title="Verificar correo" message={message} ok={ok}>
      <Link to="/iniciar-sesion" className="font-display text-sm font-semibold text-primary-container hover:underline">
        Ir a iniciar sesión
      </Link>
    </TokenLayout>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(token ? "" : "El enlace no trae un token de recuperación.");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const issue = passwordIssue(password, confirmPassword);
    if (issue) {
      setError(issue);
      return;
    }
    setPending(true);
    setError("");
    try {
      await resetPassword({ token, password, confirmPassword });
      setDone(true);
    } catch (caught) {
      setError(apiErrorMessage(caught, "No pudimos restablecer la contraseña."));
    } finally {
      setPending(false);
    }
  }

  return (
    <TokenLayout title="Nueva contraseña" message={done ? "Tu contraseña quedó actualizada. Entra de nuevo con la clave nueva." : "Elige una contraseña de 8 a 128 caracteres, con mayúscula, minúscula y número."} ok={done}>
      {done ? (
        <Link to="/iniciar-sesion" className="font-display text-sm font-semibold text-primary-container hover:underline">
          Ir a iniciar sesión
        </Link>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <label className="block space-y-1.5">
            <span className="font-display text-sm font-semibold">Contraseña</span>
            <input required type="password" className={fieldClass} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
          </label>
          <label className="block space-y-1.5">
            <span className="font-display text-sm font-semibold">Confirmación</span>
            <input required type="password" className={fieldClass} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
          </label>
          {error ? (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={pending || !token} className="w-full rounded-lg bg-primary py-3 font-display text-sm font-semibold text-white disabled:opacity-60">
            {pending ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>
      )}
    </TokenLayout>
  );
}

function TokenLayout({ title, message, ok, children }: { title: string; message: string; ok: boolean; children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <Logo size="sm" className="mb-6" />
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        <p className={`mt-3 text-sm leading-6 ${ok ? "text-primary" : "text-ink-soft"}`} role="status">
          {message}
        </p>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
