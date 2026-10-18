"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import {
  MODERATION_REASON_LABELS,
  MODERATION_STATUS_LABELS,
  moderationStatusVariant,
} from "@/lib/admin/moderacion/labels";
import type { ModerationDetail } from "@/lib/admin/moderacion/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  EyeOff,
  Trash2,
  X,
} from "lucide-react";

interface ModeracionDetailPanelProps {
  open: boolean;
  item?: ModerationDetail;
  isLoading?: boolean;
  isError?: boolean;
  onClose: () => void;
  onApprove: () => void;
  onDelete: () => void;
  onHide: () => void;
  onWarn: () => void;
}

export function ModeracionDetailPanel({
  open,
  item,
  isLoading,
  isError,
  onClose,
  onApprove,
  onDelete,
  onHide,
  onWarn,
}: ModeracionDetailPanelProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-mu-border bg-white shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Detalle de moderación"
        aria-hidden={!open}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-mu-border px-5">
          <h2 className="font-heading text-base font-semibold text-mu-text">
            Caso de moderación
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-mu-text-muted hover:bg-mu-accent"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 space-y-4 p-5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : isError || !item ? (
          <div className="flex flex-1 items-center justify-center p-5 text-sm text-mu-text-muted">
            No se pudo cargar el caso de moderación.
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="warning">
                  {MODERATION_REASON_LABELS[item.reason]}
                </Badge>
                <Badge variant={moderationStatusVariant(item.status)}>
                  {MODERATION_STATUS_LABELS[item.status]}
                </Badge>
              </div>

              <h3 className="mt-4 font-heading text-lg font-semibold text-mu-text">
                {item.publicationTitle}
              </h3>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-mu-text-muted">Usuario</dt>
                  <dd className="font-medium">{item.userName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mu-text-muted">Fecha</dt>
                  <dd>{formatDateTime(item.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mu-text-muted">Reportes</dt>
                  <dd>{item.reportCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mu-text-muted">Detección IA</dt>
                  <dd className="inline-flex items-center gap-1">
                    {item.aiFlagged ? (
                      <>
                        <Bot className="h-3.5 w-3.5 text-mu-primary" />
                        {item.aiConfidence != null
                          ? `${Math.round(item.aiConfidence * 100)}%`
                          : "Detectado"}
                      </>
                    ) : (
                      "No"
                    )}
                  </dd>
                </div>
              </dl>

              {item.aiAnalysis ? (
                <div className="mt-4 rounded-xl border border-mu-primary/20 bg-mu-accent p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-mu-primary">
                    Análisis IA
                  </p>
                  <p className="mt-2 text-sm text-mu-text">{item.aiAnalysis}</p>
                </div>
              ) : null}

              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                  Contenido
                </p>
                <div className="mt-2 rounded-xl bg-mu-accent p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-mu-text">
                    {item.publicationContent || "Sin contenido disponible."}
                  </p>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-mu-border p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                Acciones (auditadas)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" size="sm" onClick={onApprove}>
                  <CheckCircle className="h-4 w-4" />
                  Aprobar
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onHide}>
                  <EyeOff className="h-4 w-4" />
                  Ocultar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-mu-error hover:text-mu-error"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onWarn}>
                  <AlertTriangle className="h-4 w-4" />
                  Advertir
                </Button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
