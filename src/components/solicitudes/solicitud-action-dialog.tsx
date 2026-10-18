"use client";

import { Button } from "@/components/admin/ui/button";
import { Label } from "@/components/admin/ui/label";
import { Textarea } from "@/components/admin/ui/textarea";
import type { SolicitudListItem } from "@/lib/admin/solicitudes/types";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type DialogMode =
  | "approve"
  | "reject"
  | "request_info"
  | "require_supervisor"
  | null;

interface SolicitudActionDialogProps {
  mode: DialogMode;
  request?: SolicitudListItem | null;
  isPending?: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: (message: string) => void;
  onRequireSupervisor: () => void;
}

export function SolicitudActionDialog({
  mode,
  request,
  isPending,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
  onRequireSupervisor,
}: SolicitudActionDialogProps) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode === "request_info") {
      setMessage("");
    }
  }, [mode]);

  const titles: Record<NonNullable<DialogMode>, string> = {
    approve: "Aprobar solicitud",
    reject: "Rechazar solicitud",
    request_info: "Solicitar información",
    require_supervisor: "Supervisor requerido",
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
            Se enviará una notificación automática al solicitante.
          </p>

          {mode === "approve" ? (
            <ConfirmBody
              text={`¿Aprobar la solicitud de ${request?.name}? El profesional quedará verificado en la plataforma.`}
              confirmLabel="Aprobar"
              isPending={isPending}
              onCancel={onClose}
              onConfirm={onApprove}
            />
          ) : null}

          {mode === "reject" ? (
            <ConfirmBody
              text={`¿Rechazar la solicitud de ${request?.name}? Se notificará al solicitante.`}
              confirmLabel="Rechazar"
              confirmClassName="bg-mu-error hover:bg-mu-error/90"
              isPending={isPending}
              onCancel={onClose}
              onConfirm={onReject}
            />
          ) : null}

          {mode === "require_supervisor" ? (
            <ConfirmBody
              text={`¿Marcar que ${request?.name} requiere supervisión clínica antes de aprobar?`}
              confirmLabel="Confirmar"
              isPending={isPending}
              onCancel={onClose}
              onConfirm={onRequireSupervisor}
            />
          ) : null}

          {mode === "request_info" ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-mu-text-muted">
                Indica qué información adicional necesitas de{" "}
                <span className="font-medium text-mu-text">{request?.name}</span>.
              </p>
              <div>
                <Label htmlFor="info-message">Mensaje</Label>
                <Textarea
                  id="info-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe los documentos o datos que faltan…"
                  className="mt-1.5"
                />
              </div>
              <Button
                type="button"
                className="w-full"
                loading={isPending}
                disabled={isPending || !message.trim()}
                onClick={() => onRequestInfo(message.trim())}
              >
                Enviar solicitud
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
