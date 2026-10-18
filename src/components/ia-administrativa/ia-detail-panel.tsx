"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import {
  BotIcon,
  IA_ALERT_STATUS_LABELS,
  IA_ALERT_TYPE_LABELS,
  IA_DISCLAIMER,
  confidenceColor,
  iaStatusVariant,
} from "@/lib/admin/ia-administrativa/labels";
import type { IaAlertDetail } from "@/lib/admin/ia-administrativa/types";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  CheckCircle,
  Eye,
  X,
  XCircle,
} from "lucide-react";

interface IaDetailPanelProps {
  open: boolean;
  alert?: IaAlertDetail;
  isLoading?: boolean;
  isError?: boolean;
  onClose: () => void;
  onReview: () => void;
  onIgnore: () => void;
  onApprove: () => void;
  onEscalate: () => void;
}

export function IaDetailPanel({
  open,
  alert,
  isLoading,
  isError,
  onClose,
  onReview,
  onIgnore,
  onApprove,
  onEscalate,
}: IaDetailPanelProps) {
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
        aria-label="Detalle de alerta IA"
        aria-hidden={!open}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-mu-border px-5">
          <h2 className="font-heading text-base font-semibold text-mu-text">
            Sugerencia de IA
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
            <Skeleton className="h-32 w-full" />
          </div>
        ) : isError || !alert ? (
          <div className="flex flex-1 items-center justify-center p-5 text-sm text-mu-text-muted">
            No se pudo cargar la alerta.
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">
                  {IA_ALERT_TYPE_LABELS[alert.type]}
                </Badge>
                <Badge variant={iaStatusVariant(alert.status)}>
                  {IA_ALERT_STATUS_LABELS[alert.status]}
                </Badge>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-mu-text-muted">Usuario</dt>
                  <dd className="font-medium">{alert.userName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mu-text-muted">Motivo</dt>
                  <dd>{alert.reason}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mu-text-muted">Confianza IA</dt>
                  <dd
                    className={`inline-flex items-center gap-1 font-medium ${confidenceColor(alert.aiConfidence)}`}
                  >
                    <BotIcon className="h-4 w-4" />
                    {Math.round(alert.aiConfidence * 100)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-mu-text-muted">Fecha</dt>
                  <dd>{formatDateTime(alert.createdAt)}</dd>
                </div>
              </dl>

              {alert.aiAnalysis ? (
                <div className="mt-4 rounded-xl border border-mu-primary/20 bg-mu-accent p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-mu-primary">
                    Análisis IA
                  </p>
                  <p className="mt-2 text-sm text-mu-text">{alert.aiAnalysis}</p>
                </div>
              ) : null}

              {alert.suggestedAction ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                    Acción sugerida (no automática)
                  </p>
                  <p className="mt-2 text-sm text-mu-text">
                    {alert.suggestedAction}
                  </p>
                </div>
              ) : null}

              {alert.context ? (
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                    Contexto
                  </p>
                  <p className="mt-2 whitespace-pre-wrap rounded-xl bg-mu-accent p-4 text-sm text-mu-text">
                    {alert.context}
                  </p>
                </div>
              ) : null}

              <p className="mt-4 text-xs text-mu-text-muted">{IA_DISCLAIMER}</p>
            </div>

            <div className="shrink-0 border-t border-mu-border p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                Tu decisión
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onReview}>
                  <Eye className="h-4 w-4" />
                  Revisar
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onIgnore}>
                  <XCircle className="h-4 w-4" />
                  Ignorar
                </Button>
                <Button type="button" size="sm" onClick={onApprove}>
                  <CheckCircle className="h-4 w-4" />
                  Aprobar
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onEscalate}>
                  <ArrowUpRight className="h-4 w-4" />
                  Escalar
                </Button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
