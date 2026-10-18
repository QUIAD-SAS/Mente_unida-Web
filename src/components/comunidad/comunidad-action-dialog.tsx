"use client";

import { Button } from "@/components/admin/ui/button";
import { Label } from "@/components/admin/ui/label";
import { Textarea } from "@/components/admin/ui/textarea";
import type { CommunityPostListItem } from "@/lib/admin/comunidad/types";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type DialogMode = "hide" | "delete" | "warn" | "suspend" | null;

interface ComunidadActionDialogProps {
  mode: DialogMode;
  post?: CommunityPostListItem | null;
  isPending?: boolean;
  onClose: () => void;
  onHide: () => void;
  onDelete: () => void;
  onWarn: (reason: string) => void;
  onSuspend: () => void;
}

export function ComunidadActionDialog({
  mode,
  post,
  isPending,
  onClose,
  onHide,
  onDelete,
  onWarn,
  onSuspend,
}: ComunidadActionDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (mode === "warn") setReason("");
  }, [mode]);

  const titles: Record<NonNullable<DialogMode>, string> = {
    hide: "Ocultar publicación",
    delete: "Eliminar publicación",
    warn: "Advertir autor",
    suspend: "Suspender autor",
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

          {mode === "hide" ? (
            <ConfirmBody
              text={`¿Ocultar la publicación "${post?.title}"? Dejará de ser visible en la comunidad.`}
              confirmLabel="Ocultar"
              isPending={isPending}
              onCancel={onClose}
              onConfirm={onHide}
            />
          ) : null}

          {mode === "delete" ? (
            <ConfirmBody
              text={`¿Eliminar permanentemente "${post?.title}"? Esta acción quedará registrada en auditoría.`}
              confirmLabel="Eliminar"
              confirmClassName="bg-mu-error hover:bg-mu-error/90"
              isPending={isPending}
              onCancel={onClose}
              onConfirm={onDelete}
            />
          ) : null}

          {mode === "suspend" ? (
            <ConfirmBody
              text={`¿Suspender a ${post?.authorName}? No podrá publicar en la comunidad.`}
              confirmLabel="Suspender"
              confirmClassName="bg-mu-error hover:bg-mu-error/90"
              isPending={isPending}
              onCancel={onClose}
              onConfirm={onSuspend}
            />
          ) : null}

          {mode === "warn" ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-mu-text-muted">
                Enviar advertencia a{" "}
                <span className="font-medium text-mu-text">{post?.authorName}</span>{" "}
                por la publicación &ldquo;{post?.title}&rdquo;.
              </p>
              <div>
                <Label htmlFor="warn-reason">Motivo</Label>
                <Textarea
                  id="warn-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe el motivo de la advertencia…"
                  className="mt-1.5"
                />
              </div>
              <Button
                type="button"
                className="w-full"
                loading={isPending}
                disabled={isPending || !reason.trim()}
                onClick={() => onWarn(reason.trim())}
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
