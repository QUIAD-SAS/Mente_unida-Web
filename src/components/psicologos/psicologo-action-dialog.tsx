"use client";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { PasswordInput } from "@/components/admin/ui/password-input";
import { Textarea } from "@/components/admin/ui/textarea";
import type {
  PsychologistListItem,
  PsychologistProfile,
  PsychologistUpdatePayload,
} from "@/lib/admin/psicologos/types";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type DialogMode = "edit" | "password" | null;

interface PsicologoActionDialogProps {
  mode: DialogMode;
  psychologist?: PsychologistListItem | null;
  profile?: PsychologistProfile | null;
  isLoadingProfile?: boolean;
  isPending?: boolean;
  onClose: () => void;
  onEdit: (data: PsychologistUpdatePayload) => void;
  onChangePassword: (password: string) => void;
}

export function PsicologoActionDialog({
  mode,
  psychologist,
  profile,
  isLoadingProfile,
  isPending,
  onClose,
  onEdit,
  onChangePassword,
}: PsicologoActionDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("CO");
  const [languages, setLanguages] = useState("es");
  const [price, setPrice] = useState("");
  const [modalityOnline, setModalityOnline] = useState(true);
  const [modalityInPerson, setModalityInPerson] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");

  const source = profile ?? psychologist;

  useEffect(() => {
    if (!source || mode !== "edit") return;

    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setPhone(profile.phone === "—" ? "" : profile.phone);
      setBio(profile.bio ?? "");
      setSpecialties(profile.specialties.join(", "));
      setCity(profile.city);
      setCountry(profile.country || "CO");
      setLanguages(profile.languages.join(", "));
      setPrice(String(profile.priceCents / 100));
      setModalityOnline(profile.modalityOnline);
      setModalityInPerson(profile.modalityInPerson);
      setIsActive(profile.isActive);
      return;
    }

    setName(psychologist!.name);
    setSpecialties(
      psychologist!.specialty === "—" ? "" : psychologist!.specialty,
    );
    setIsActive(psychologist!.isActive);
  }, [source, profile, psychologist, mode]);

  useEffect(() => {
    if (mode === "password") setPassword("");
  }, [mode]);

  const titles: Record<NonNullable<DialogMode>, string> = {
    edit: "Editar psicólogo",
    password: "Cambiar contraseña",
  };

  return (
    <Dialog.Root open={Boolean(mode)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-mu-border bg-white shadow-xl">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-mu-border px-6 py-4">
            <Dialog.Title className="font-heading text-lg font-semibold text-mu-text">
              {mode ? titles[mode] : ""}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mu-text-muted hover:bg-mu-accent"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {mode === "edit" ? (
              isLoadingProfile ? (
                <p className="py-8 text-center text-sm text-mu-text-muted">
                  Cargando perfil completo…
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Identificador (slug)" id="psy-slug">
                      <Input
                        id="psy-slug"
                        value={profile?.slug ?? ""}
                        readOnly
                        disabled
                        className="bg-mu-accent/60"
                      />
                    </Field>
                    <Field label="Nombre completo" id="psy-name">
                      <Input
                        id="psy-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Field>
                    <Field label="Correo" id="psy-email">
                      <Input
                        id="psy-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Field>
                    <Field label="Teléfono" id="psy-phone">
                      <Input
                        id="psy-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </Field>
                    <Field label="Tarifa (COP)" id="psy-price">
                      <Input
                        id="psy-price"
                        type="number"
                        min={0}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </Field>
                    <Field label="Ciudad" id="psy-city">
                      <Input
                        id="psy-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </Field>
                    <Field label="País" id="psy-country">
                      <Input
                        id="psy-country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field label="Especialidades (separadas por coma)" id="psy-specialties">
                    <Input
                      id="psy-specialties"
                      value={specialties}
                      onChange={(e) => setSpecialties(e.target.value)}
                      placeholder="Psicología Clínica, Parejas"
                    />
                  </Field>

                  <Field label="Biografía profesional" id="psy-bio">
                    <Textarea
                      id="psy-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                    />
                  </Field>

                  <Field label="Idiomas (separados por coma)" id="psy-languages">
                    <Input
                      id="psy-languages"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="es, en"
                    />
                  </Field>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 rounded-xl border border-mu-border px-4 py-3 text-sm">
                      <input
                        type="checkbox"
                        checked={modalityOnline}
                        onChange={(e) => setModalityOnline(e.target.checked)}
                      />
                      Atención en línea
                    </label>
                    <label className="flex items-center gap-2 rounded-xl border border-mu-border px-4 py-3 text-sm">
                      <input
                        type="checkbox"
                        checked={modalityInPerson}
                        onChange={(e) => setModalityInPerson(e.target.checked)}
                      />
                      Atención presencial
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-mu-border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-mu-text">
                        Cuenta activa
                      </p>
                      <p className="text-xs text-mu-text-muted">
                        Desactiva para suspender el acceso del psicólogo.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isActive}
                      onClick={() => setIsActive((current) => !current)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        isActive ? "bg-mu-primary" : "bg-mu-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          isActive ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )
            ) : null}

            {mode === "password" ? (
              <div className="space-y-4">
                <p className="text-sm text-mu-text-muted">
                  Establece una nueva contraseña para{" "}
                  <span className="font-medium text-mu-text">
                    {psychologist?.name ?? "el psicólogo"}
                  </span>
                  .
                </p>
                <Field label="Nueva contraseña" id="psy-password">
                  <PasswordInput
                    id="psy-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
              </div>
            ) : null}
          </div>

          {mode === "edit" ? (
            <div className="shrink-0 border-t border-mu-border px-6 py-4">
              <Button
                type="button"
                className="w-full"
                loading={isPending}
                disabled={isPending || isLoadingProfile}
                onClick={() => {
                  const specialtyList = specialties
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);

                  onEdit({
                    name,
                    email,
                    phone,
                    bio,
                    specialty: specialtyList[0],
                    specialties: specialtyList,
                    city,
                    country,
                    languages: languages
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                    priceCents: Math.round((Number(price) || 0) * 100),
                    modalityOnline,
                    modalityInPerson,
                    isActive,
                  });
                }}
              >
                Guardar cambios
              </Button>
            </div>
          ) : null}

          {mode === "password" ? (
            <div className="shrink-0 border-t border-mu-border px-6 py-4">
              <Button
                type="button"
                className="w-full"
                loading={isPending}
                disabled={isPending || password.length < 8}
                onClick={() => onChangePassword(password)}
              >
                Cambiar contraseña
              </Button>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
