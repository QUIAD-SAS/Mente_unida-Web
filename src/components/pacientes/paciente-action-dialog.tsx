"use client";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { PasswordInput } from "@/components/admin/ui/password-input";
import { Textarea } from "@/components/admin/ui/textarea";
import type { PatientListItem } from "@/lib/admin/pacientes/types";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type DialogMode = "edit" | "password" | null;

interface PacienteActionDialogProps {
  mode: DialogMode;
  patient?: PatientListItem | null;
  isPending?: boolean;
  onClose: () => void;
  onEdit: (data: {
    name: string;
    email: string;
    phone: string;
    emergencyContact: string;
    isActive: boolean;
  }) => void;
  onChangePassword: (password: string) => void;
}

export function PacienteActionDialog({
  mode,
  patient,
  isPending,
  onClose,
  onEdit,
  onChangePassword,
}: PacienteActionDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (patient && mode === "edit") {
      setName(patient.name);
      setEmail(patient.email);
      setPhone(patient.phone === "—" ? "" : patient.phone);
      setEmergencyContact(
        patient.emergencyContact === "—" ? "" : patient.emergencyContact,
      );
      setIsActive(patient.status !== "suspended");
    }
    if (mode === "password") {
      setPassword("");
    }
  }, [patient, mode]);

  const titles: Record<NonNullable<DialogMode>, string> = {
    edit: "Editar paciente",
    password: "Cambiar contraseña",
  };

  return (
    <Dialog.Root open={Boolean(mode)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-mu-border bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
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

          {mode === "edit" ? (
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="edit-alias">Alias</Label>
                <Input
                  id="edit-alias"
                  value={patient?.alias ?? ""}
                  readOnly
                  disabled
                  className="mt-1.5 bg-mu-accent/60"
                />
                <p className="mt-1 text-xs text-mu-text-muted">
                  El alias no se puede modificar.
                </p>
              </div>
              <div>
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Correo</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input
                  id="edit-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edit-emergency">Contacto emergencia</Label>
                <Input
                  id="edit-emergency"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-mu-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-mu-text">
                    Cuenta activa
                  </p>
                  <p className="text-xs text-mu-text-muted">
                    Desactiva para suspender el acceso del paciente.
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
              <Button
                type="button"
                className="w-full"
                loading={isPending}
                disabled={isPending}
                onClick={() =>
                  onEdit({ name, email, phone, emergencyContact, isActive })
                }
              >
                Guardar cambios
              </Button>
            </div>
          ) : null}

          {mode === "password" ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-mu-text-muted">
                Establece una nueva contraseña para{" "}
                <span className="font-medium text-mu-text">
                  {patient?.alias ?? "el paciente"}
                </span>
                .
              </p>
              <div>
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <PasswordInput
                  id="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5"
                  autoComplete="new-password"
                />
              </div>
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

interface AddNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  isPending?: boolean;
}

export function AddNoteDialog({
  open,
  onClose,
  onSubmit,
  isPending,
}: AddNoteDialogProps) {
  const [note, setNote] = useState("");

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-mu-border bg-white p-6 shadow-xl">
          <Dialog.Title className="font-heading text-lg font-semibold text-mu-text">
            Agregar nota
          </Dialog.Title>
          <div className="mt-4">
            <Label htmlFor="patient-note">Nota interna</Label>
            <Textarea
              id="patient-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escribe una nota sobre el paciente…"
              className="mt-1.5"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1"
              loading={isPending}
              disabled={isPending || !note.trim()}
              onClick={() => {
                onSubmit(note.trim());
                setNote("");
              }}
            >
              Guardar nota
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
