"use client";

import { Button } from "@/components/admin/ui/button";
import { Label } from "@/components/admin/ui/label";
import { Textarea } from "@/components/admin/ui/textarea";
import type { ModerationListItem } from "@/lib/admin/moderacion/types";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type DialogMode = "approve" | "delete" | "hide" | "warn" | null;

interface ModeracionActionDialogProps {
  mode: DialogMode;
  item?: ModerationListItem | null;
  isPending?: boolean;
  onClose: () => void;
  onApprove: () => void;
  onDelete: () => void;
  onHide: () => void;
  onWarn: (message: string) => void;
}

export function ModeracionActionDialog({
  mode,
  item,
  isPending,
  onClose,
  onApprove,
  onDelete,
  onHide,
  onWarn,
}: ModeracionActionDialogProps) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode === "warn") setMessage("");
  }, [mode]);

  const titles: Record<NonNullable<DialogMode>, string> = {
    approve: "Aprobar publicación",
    delete: "Eliminar publicación",
    hide: "Ocultar publicación",
    warn: "Advertir usuario",
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

          <p className="mt-2 text-xs text-mu-text-muted">
            Esta acción quedará registrada en auditoría.
          </p>

          {mode === "approve" ? (
            <ConfirmBody
              text={`¿Aprobar "${item?.publicationTitle}"? El contenido permanecerá visible.`}
              confirmLabel="Aprobar"
              isPending={isPending}
              onCancel={onClose}
              onConfirm={onApprove}
            />
          ) : null}

          {mode === "hide" ? (
            <ConfirmBody
              text={`¿Ocultar "${item?.publicationTitle}"? Dejará de ser visible.`}
              confirmLabel="Ocultar"
              isPending={isPending}
              onCancel={onClose}
              onConfirm={onHide}
            />
          ) : null}

          {mode === "delete" ? (
            <ConfirmBody
              text={`¿Eliminar "${item?.publicationTitle}"? Acción irreversible, quedará auditada.`}
              confirmLabel="Eliminar"
              confirmClassName="bg-mu-error hover:bg-mu-error/90"
              isPending={isPending}
              onCancel={onClose}
              onConfirm={onDelete}
            />
          ) : null}

          {mode === "warn" ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-mu-text-muted">
                Advertir a{" "}
                <span className="font-medium text-mu-text">{item?.userName}</span>{" "}
                sobre el contenido reportado.
              </p>
              <div>
                <Label htmlFor="warn-msg">Mensaje</Label>
                <Textarea
                  id="warn-msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Motivo de la advertencia…"
                  className="mt-1.5"
                />
              </div>
              <Button
                type="button"
                className="w-full"
                loading={isPending}
                disabled={isPending || !message.trim()}
                onClick={() => onWarn(message.trim())}
              >
                Enviar advertencia
              </Button>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ConfirmBody({
  text,
  confirmLabel,
  confirmClassName,
  isPending,
  onCancel,
  onConfirm,
}: {
  text: string;
  confirmLabel: string;
  confirmClassName?: string;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-mu-text-muted">{text}</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          className={confirmClassName ?? "flex-1"}
          loading={isPending}
          disabled={isPending}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
