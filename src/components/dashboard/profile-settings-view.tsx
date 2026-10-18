"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FormField, FormTextarea } from "@/components/ui/form-field";
import { api, ApiError } from "@/lib/api-client";
import type { EditableProfile, SensitiveProfile } from "@/lib/api/types";
import { getDisplayAlias, maskValue } from "@/lib/auth/display";
import { useSession } from "@/lib/auth/session-context";
import { useAuthStore } from "@/lib/auth/store";
import { Lock, Shield, User } from "lucide-react";
import { FormEvent, useState } from "react";

interface ProfileSettingsViewProps {
  role: "patient" | "psychologist";
}

function PsychologistProfileSettings() {
  const token = useAuthStore((s) => s.token)!;
  const { session, refresh } = useSession();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockToken, setUnlockToken] = useState<string | null>(null);
  const [sensitive, setSensitive] = useState<SensitiveProfile | null>(null);
  const [form, setForm] = useState<EditableProfile>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verificationStatus =
    session?.profile.psychologist?.verificationStatus ?? null;
  const displayName =
    sensitive?.name ?? session?.profile.name ?? session?.alias ?? "Profesional";

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    setUnlocking(true);
    setError(null);
    setMessage(null);

    try {
      const data = await api.profile.unlock(token, password);
      setSensitive(data);
      setUnlockToken(data.unlockToken ?? null);
      setForm({
        name: data.name ?? "",
        phone: data.phone ?? "",
        city: data.city ?? "",
        bio: data.bio ?? "",
      });
      setUnlocked(true);
      setPassword("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Contraseña incorrecta o no se pudo desbloquear el perfil",
      );
    } finally {
      setUnlocking(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!unlocked || !unlockToken) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await api.profile.update(token, form, { unlockToken });
      await refresh();
      setMessage("Perfil actualizado correctamente.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo guardar el perfil",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLock() {
    setUnlocked(false);
    setSensitive(null);
    setUnlockToken(null);
    setForm({});
    setPassword("");
    setError(null);
    setMessage(null);
  }

  return (
    <DashboardShell role="psychologist">
        <header>
          <h1 className="font-heading text-2xl font-bold text-mu-text">
            Configuración
          </h1>
          <p className="mt-1 text-mu-text-muted">
            Administra tu perfil profesional visible para quienes buscan apoyo.
          </p>
        </header>

        <Card className="mt-6 max-w-lg">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 shrink-0 text-mu-primary" aria-hidden />
            <div>
              <CardTitle className="text-base">{displayName}</CardTitle>
              {verificationStatus ? (
                <CardDescription className="mt-1">
                  Estado de verificación:{" "}
                  <strong>{verificationStatus}</strong>
                </CardDescription>
              ) : null}
            </div>
          </div>
        </Card>

        {!unlocked ? (
          <Card className="mt-6 max-w-lg">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-mu-primary" aria-hidden />
              Información profesional protegida
            </CardTitle>
            <CardDescription className="mt-2">
              Ingresa tu contraseña para ver y editar datos personales de tu
              cuenta profesional.
            </CardDescription>

            <form className="mt-6 space-y-4" onSubmit={handleUnlock}>
              {error ? (
                <p
                  className="rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
              <FormField
                label="Contraseña"
                name="psychologist-unlock-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button type="submit" disabled={unlocking}>
                {unlocking ? "Verificando…" : "Desbloquear perfil"}
              </Button>
            </form>
          </Card>
        ) : (
          <form className="mt-8 max-w-lg space-y-4" onSubmit={onSubmit}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-mu-success">
                Información desbloqueada
              </p>
              <Button type="button" variant="ghost" size="sm" onClick={handleLock}>
                Volver a ocultar
              </Button>
            </div>

            {error ? (
              <p
                className="rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-mu border border-mu-success/30 bg-mu-success/5 px-3 py-2 text-sm text-mu-success">
                {message}
              </p>
            ) : null}

            <FormField
              label="Correo"
              name="email"
              type="email"
              value={sensitive?.email ?? ""}
              readOnly
              disabled
            />
            <FormField
              label="Nombre completo"
              name="name"
              value={form.name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <FormField
              label="Teléfono"
              name="phone"
              value={form.phone ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <FormField
              label="Ciudad"
              name="city"
              value={form.city ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            <FormTextarea
              label="Biografía"
              name="bio"
              rows={4}
              value={form.bio ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />

            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </form>
        )}
    </DashboardShell>
  );
}

function PatientProfileSettings() {
  const token = useAuthStore((s) => s.token)!;
  const { session, refresh } = useSession();
  const alias = getDisplayAlias(session);

  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockToken, setUnlockToken] = useState<string | null>(null);
  const [sensitive, setSensitive] = useState<SensitiveProfile | null>(null);
  const [form, setForm] = useState<EditableProfile>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    setUnlocking(true);
    setError(null);

    try {
      const data = await api.profile.unlock(token, password);
      setSensitive(data);
      setUnlockToken(data.unlockToken ?? null);
      setForm({
        name: data.name ?? "",
        phone: data.phone ?? "",
        city: data.city ?? "",
        country: data.country ?? "",
        emergencyContact: data.emergencyContact ?? "",
      });
      setUnlocked(true);
      setPassword("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Contraseña incorrecta o no se pudo desbloquear el perfil",
      );
    } finally {
      setUnlocking(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!unlocked || !unlockToken) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await api.profile.update(token, form, { unlockToken });
      await refresh();
      setMessage("Perfil actualizado correctamente.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo guardar el perfil",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLock() {
    setUnlocked(false);
    setSensitive(null);
    setUnlockToken(null);
    setForm({});
    setPassword("");
    setError(null);
    setMessage(null);
  }

  return (
    <DashboardShell role="patient">
        <header>
          <h1 className="font-heading text-2xl font-bold text-mu-text">
            Configuración
          </h1>
          <p className="mt-1 text-mu-text-muted">
            Tu información personal está protegida. Solo tú puedes verla con tu
            contraseña.
          </p>
        </header>

        <Card className="mt-6 max-w-lg border-mu-primary/20 bg-mu-accent/30">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 shrink-0 text-mu-primary" aria-hidden />
            <div>
              <CardTitle className="text-base">Tu alias</CardTitle>
              <p className="mt-1 font-heading text-xl font-bold text-mu-primary">
                {alias}
              </p>
              <CardDescription className="mt-1">
                Este es el nombre que ven los profesionales. No se puede cambiar.
              </CardDescription>
            </div>
          </div>
        </Card>

        {!unlocked ? (
          <Card className="mt-6 max-w-lg">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-mu-primary" aria-hidden />
              Información protegida
            </CardTitle>
            <CardDescription className="mt-2">
              Tus datos personales (correo, teléfono, documento, etc.) están
              ocultos. Ingresa tu contraseña para verlos y editarlos.
            </CardDescription>

            <ul className="mt-4 space-y-2 text-sm text-mu-text-muted">
              <li>Correo: {maskValue("usuario@correo.com")}</li>
              <li>Teléfono: {maskValue("3001234567")}</li>
              <li>Documento: {maskValue("1234567890")}</li>
              <li>Ciudad: {maskValue("Bogotá")}</li>
            </ul>

            <form className="mt-6 space-y-4" onSubmit={handleUnlock}>
              {error ? (
                <p
                  className="rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
              <FormField
                label="Contraseña"
                name="unlock-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button type="submit" disabled={unlocking}>
                {unlocking ? "Verificando…" : "Desbloquear información"}
              </Button>
            </form>
          </Card>
        ) : (
          <form className="mt-8 max-w-lg space-y-4" onSubmit={handleSave}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-mu-success">
                Información desbloqueada
              </p>
              <Button type="button" variant="ghost" size="sm" onClick={handleLock}>
                Volver a ocultar
              </Button>
            </div>

            {error ? (
              <p
                className="rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-mu border border-mu-success/30 bg-mu-success/5 px-3 py-2 text-sm text-mu-success">
                {message}
              </p>
            ) : null}

            <FormField
              label="Correo"
              name="email"
              type="email"
              value={sensitive?.email ?? ""}
              readOnly
              disabled
            />
            <FormField
              label="Nombre completo"
              name="name"
              value={form.name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <FormField
              label="Teléfono"
              name="phone"
              value={form.phone ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <FormField
              label="Ciudad"
              name="city"
              value={form.city ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            <FormField
              label="País"
              name="country"
              value={form.country ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, country: e.target.value }))
              }
            />
            <FormField
              label="Contacto de emergencia"
              name="emergencyContact"
              value={form.emergencyContact ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  emergencyContact: e.target.value,
                }))
              }
            />

            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </form>
        )}
    </DashboardShell>
  );
}

export function ProfileSettingsView({ role }: ProfileSettingsViewProps) {
  if (role === "psychologist") {
    return <PsychologistProfileSettings />;
  }
  return <PatientProfileSettings />;
}
