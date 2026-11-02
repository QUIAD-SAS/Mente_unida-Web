import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { forgotPassword } from "../api/auth";
import { apiErrorMessage } from "../api/client";
import type { AccessContext } from "../api/types";
import { useAuth } from "../auth/AuthProvider";
import { Icon } from "../components/Icon";
import { Logo } from "../components/Logo";
import { fieldClass } from "../components/ui";

type Role = "user" | "psych" | "admin";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const reduce = useReducedMotion();
  const [role, setRole] = useState<Role>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryPending, setRecoveryPending] = useState(false);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-primary-fixed/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-10 h-[420px] w-[420px] rounded-full bg-secondary-fixed/40 blur-3xl" />
      <motion.div
        className="relative grid w-full max-w-[1360px] items-stretch gap-8 lg:grid-cols-12"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <aside className="relative hidden flex-col justify-between overflow-hidden rounded-2xl bg-primary-container p-10 text-white shadow-xl lg:col-span-5 lg:flex">
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-primary/40 blur-2xl" />
          <div className="pointer-events-none absolute bottom-12 -left-12 h-48 w-48 rounded-full bg-secondary-container/20 blur-xl" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="w-fit max-w-full rounded-2xl bg-white px-4 py-2.5">
              <Logo size="md" />
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-display text-xs font-semibold tracking-wide text-primary-fixed uppercase">
              <Icon name="health_and_safety" filled className="text-[16px]" />
              Plataforma Segura & Certificada
            </span>
            <div className="space-y-3">
              <h1 className="font-display text-[32px] leading-10 font-semibold tracking-tight text-surface">
                Tu santuario de serenidad y salud mental.
              </h1>
              <p className="leading-7 text-surface-highest/90">
                Un entorno confidencial, ético y humano donde cada sesión y cada conversación están protegidas bajo los más estrictos estándares clínicos.
              </p>
            </div>
          </div>
          <div className="relative z-10 my-8 space-y-4 rounded-xl bg-white/10 p-5 backdrop-blur-md">
            <div className="flex items-start gap-4">
              <span className="rounded-full bg-white/20 p-2.5">
                <Icon name="psychology" />
              </span>
              <div>
                <p className="font-display text-lg font-semibold">Validación Colegiada</p>
                <p className="mt-0.5 text-xs leading-5 text-surface-high">
                  Todos los psicólogos adscritos a Mente Unida cuentan con credenciales verificadas y supervisión continua.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="inline-flex items-center gap-2">
                <Icon name="shield_lock" className="text-[16px] text-secondary-fixed" />
                Encriptación E2E Médica
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="verified" className="text-[16px] text-primary-fixed" />
                HIPAA Compliant
              </span>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-between pt-4 text-xs text-surface-highest">
            <span>Privacidad ética garantizada</span>
            <span>© Mente Unida {new Date().getFullYear()}</span>
          </div>
        </aside>

        <section className="flex flex-col justify-center lg:col-span-7">
          <div className="relative rounded-2xl bg-white p-5 shadow-sm sm:p-8 md:p-12">
            <Link to="/" className="mb-6 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary-container hover:underline">
              <Icon name="arrow_back" className="text-[18px]" />
              Volver al inicio
            </Link>
            <div className="mb-8 flex items-center justify-between gap-3 lg:hidden">
              <Logo size="sm" />
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-mid px-2.5 py-1 text-xs text-primary">
                <Icon name="verified_user" className="text-[14px]" />
                Oficial
              </span>
            </div>
            <div className="mb-8 space-y-2">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-surface-mid px-3 py-1 font-display text-xs font-semibold text-primary-container">
                <Icon name="spa" filled className="text-[16px]" />
                Bienvenido de vuelta
              </span>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Iniciar Sesión</h2>
              <p className="text-ink-soft">Ingresa tus credenciales para acceder a tus sesiones, herramientas y seguimiento emocional.</p>
            </div>

            <div className="mb-8">
              <p className="mb-2 font-display text-sm font-semibold text-ink-soft">Selecciona tu perfil de acceso</p>
              <div className="grid grid-cols-1 gap-2 rounded-xl bg-surface-mid p-1.5 sm:grid-cols-3">
                <RoleButton active={role === "user"} icon="person" label="Soy Paciente / Usuario" onClick={() => setRole("user")} />
                <RoleButton active={role === "psych"} icon="medical_services" label="Soy Psicólogo / Especialista" onClick={() => setRole("psych")} />
                <RoleButton active={role === "admin"} icon="admin_panel_settings" label="Administración" onClick={() => setRole("admin")} />
              </div>
            </div>

            <form
              className="space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setError("");
                setPending(true);
                const context: AccessContext = role === "admin" ? "ADMIN" : role === "psych" ? "PSYCHOLOGIST" : "PATIENT";
                try {
                  const user = await login({ email, password, context, remember });
                  const home = user.accessContext === "ADMIN" ? "/admin" : user.accessContext === "PSYCHOLOGIST" ? "/psicologo" : "/paciente";
                  const from = (location.state as { from?: string } | null)?.from;
                  navigate(from && from.startsWith(home) ? from : home, { replace: true });
                } catch (caught) {
                  setError(apiErrorMessage(caught, "No pudimos iniciar sesión."));
                } finally {
                  setPending(false);
                }
              }}
            >
              <label className="block space-y-1.5">
                <span className="font-display text-sm font-semibold">Correo electrónico</span>
                <span className="relative flex items-center">
                  <Icon name="mail" className="pointer-events-none absolute left-3.5 text-[22px] text-line" />
                  <input required type="email" name="email" autoComplete="email" placeholder="ejemplo@menteunida.com" value={email} onChange={(event) => setEmail(event.target.value)} className={`${fieldClass} pl-11`} />
                </span>
              </label>

              <div className="space-y-1.5">
                <span className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <label htmlFor="password" className="font-display text-sm font-semibold">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    className="font-display text-xs font-semibold text-secondary hover:text-secondary"
                    onClick={() => {
                      setRecoveryOpen((open) => !open);
                      setRecoverySent(false);
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </span>
                <span className="relative flex items-center">
                  <Icon name="lock" className="pointer-events-none absolute left-3.5 text-[22px] text-line" />
                  <input
                    id="password"
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={`${fieldClass} pr-11 pl-11`}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 text-line hover:text-ink"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[22px]" />
                  </button>
                </span>
              </div>

              <label className="flex items-center gap-3 pt-1 text-sm text-ink-soft">
                <input type="checkbox" className="h-4 w-4 accent-primary" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                Recordar mi cuenta en este dispositivo
              </label>

              {error ? (
                <p className="text-sm text-error" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 font-display text-lg font-semibold text-white shadow-md transition hover:bg-primary-container hover:shadow-lg disabled:opacity-60"
              >
                {pending ? "Entrando…" : "Iniciar sesión"}
                <Icon name="arrow_forward" className="transition group-hover:translate-x-1" />
              </button>

              <div className="mt-2 flex flex-col items-center justify-between gap-3 rounded-xl bg-surface-low p-4 text-center sm:flex-row sm:text-left">
                <div>
                  <p className="font-display text-sm font-semibold">¿Aún no tienes una cuenta?</p>
                  <p className="text-xs text-ink-soft">Empieza tu camino hacia el bienestar emocional hoy mismo.</p>
                </div>
                <Link
                  to="/registro"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-4 py-2 font-display text-sm font-semibold text-secondary shadow-sm transition hover:bg-secondary-fixed"
                >
                  Registrarme
                  <Icon name="open_in_new" className="text-[16px]" />
                </Link>
              </div>
            </form>

            {recoveryOpen ? (
              <div className="mt-6 rounded-xl bg-surface-mid p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="lock_reset" className="text-secondary" />
                    <h3 className="font-display text-lg font-semibold">Recuperación de Contraseña</h3>
                  </div>
                  <button type="button" aria-label="Cerrar recuperación" onClick={() => setRecoveryOpen(false)}>
                    <Icon name="close" className="text-line" />
                  </button>
                </div>
                <p className="mt-2 mb-4 text-sm text-ink-soft">
                  Enviaremos un enlace al correo de este formulario. La respuesta es la misma si el correo no está registrado. En local, el enlace queda en el log del API.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    disabled={recoveryPending}
                    className="rounded-lg bg-primary px-4 py-2 font-display text-sm font-semibold text-white hover:bg-primary-container disabled:opacity-60"
                    onClick={async () => {
                      if (!email) {
                        setRecoveryError("Escribe el correo de tu cuenta para enviarte el enlace.");
                        setRecoverySent(false);
                        return;
                      }
                      setRecoveryPending(true);
                      setRecoveryError("");
                      try {
                        await forgotPassword(email.trim());
                        setRecoverySent(true);
                      } catch (caught) {
                        setRecoverySent(false);
                        setRecoveryError(apiErrorMessage(caught, "No pudimos solicitar la recuperación."));
                      } finally {
                        setRecoveryPending(false);
                      }
                    }}
                  >
                    {recoveryPending ? "Enviando…" : "Enviar enlace"}
                  </button>
                  <button type="button" className="rounded-lg px-4 py-2 font-display text-sm font-semibold text-line" onClick={() => setRecoveryOpen(false)}>
                    Cancelar
                  </button>
                </div>
                {recoveryError ? (
                  <p className="mt-3 text-sm text-error" role="alert">
                    {recoveryError}
                  </p>
                ) : null}
                {recoverySent ? (
                  <p className="mt-3 flex items-center gap-2 rounded bg-surface px-2.5 py-2 text-xs text-primary">
                    <Icon name="check_circle" className="text-[16px]" />
                    Si el correo está registrado, el enlace de recuperación ya fue generado.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-surface-mid pt-6 text-xs text-line">
              <span className="inline-flex items-center gap-2">
                <Icon name="encrypted" className="text-[16px] text-primary" />
                Cifrado TLS 1.3 de extremo a extremo
              </span>
              <span className="flex items-center gap-4">
                <Link to="/privacidad" className="hover:text-ink hover:underline">
                  Aviso de Privacidad
                </Link>
                <span>•</span>
                <Link to="/terminos" className="hover:text-ink hover:underline">
                  Términos de Servicio
                </Link>
              </span>
            </div>
          </div>
        </section>
      </motion.div>
    </main>
  );
}

function RoleButton({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-3 py-3 text-center font-display text-sm leading-5 font-semibold transition ${active ? "bg-white text-primary shadow-sm" : "text-ink-soft hover:text-ink"}`}
    >
      <Icon name={icon} filled={active} className="text-[18px]" />
      {label}
    </button>
  );
}
