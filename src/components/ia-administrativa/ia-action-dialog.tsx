"use client";

import { Button } from "@/components/admin/ui/button";
import type { IaAlertListItem } from "@/lib/admin/ia-administrativa/types";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type DialogMode = "review" | "ignore" | "approve" | "escalate" | null;

interface IaActionDialogProps {
  mode: DialogMode;
  alert?: IaAlertListItem | null;
  isPending?: boolean;
  onClose: () => void;
  onReview: () => void;
  onIgnore: () => void;
  onApprove: () => void;
  onEscalate: () => void;
}

export function IaActionDialog({
  mode,
  alert,
  isPending,
  onClose,
  onReview,
  onIgnore,
  onApprove,
  onEscalate,
}: IaActionDialogProps) {
  const titles: Record<NonNullable<DialogMode>, string> = {
    review: "Marcar como revisado",
    ignore: "Ignorar sugerencia",
    approve: "Aprobar sugerencia IA",
    escalate: "Escalar alerta",
  };

  const messages: Record<NonNullable<DialogMode>, string> = {
    review: `¿Marcar como revisada la alerta sobre "${alert?.reason}"?`,
    ignore: `¿Ignorar la sugerencia de IA? No se tomará ninguna acción automática.`,
    approve: `¿Aprobar la sugerencia de IA y proceder con la acción recomendada?`,
    escalate: `¿Escalar esta alerta al equipo correspondiente?`,
  };

  const handlers: Record<NonNullable<DialogMode>, () => void> = {
    review: onReview,
    ignore: onIgnore,
    approve: onApprove,
    escalate: onEscalate,
  };

  const labels: Record<NonNullable<DialogMode>, string> = {
    review: "Marcar revisado",
    ignore: "Ignorar",
    approve: "Aprobar",
    escalate: "Escalar",
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
            Decisión humana — la IA no ejecuta acciones automáticamente.
          </p>

          {mode ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-mu-text-muted">{messages[mode]}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  loading={isPending}
                  disabled={isPending}
                  onClick={handlers[mode]}
                >
                  {labels[mode]}
                </Button>
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
