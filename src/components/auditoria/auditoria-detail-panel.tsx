"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import {
  AUDIT_MODULE_LABELS,
  AUDIT_READONLY_NOTICE,
} from "@/lib/admin/auditoria/labels";
import type { AuditLogDetail } from "@/lib/admin/auditoria/types";
import { cn } from "@/lib/utils";
import { Lock, X } from "lucide-react";

interface AuditoriaDetailPanelProps {
  open: boolean;
  log?: AuditLogDetail;
  isLoading?: boolean;
  isError?: boolean;
  onClose: () => void;
}

export function AuditoriaDetailPanel({
  open,
  log,
  isLoading,
  isError,
  onClose,
}: AuditoriaDetailPanelProps) {
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
        aria-label="Detalle de auditoría"
        aria-hidden={!open}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-mu-border px-5">
          <h2 className="font-heading text-base font-semibold text-mu-text">
            Detalle de auditoría
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
        ) : isError || !log ? (
          <div className="flex flex-1 items-center justify-center p-5 text-sm text-mu-text-muted">
            No se pudo cargar el registro.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center gap-2">
              <Badge variant="default">
                {AUDIT_MODULE_LABELS[log.module]}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-mu-text-muted">
                <Lock className="h-3 w-3" />
                Solo lectura
              </span>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-mu-text-muted">Usuario</dt>
                <dd className="font-medium">{log.userName}</dd>
              </div>
              <div>
                <dt className="text-xs text-mu-text-muted">Acción</dt>
                <dd>{log.action}</dd>
              </div>
              <div>
                <dt className="text-xs text-mu-text-muted">Fecha</dt>
                <dd>{formatDateTime(log.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-mu-text-muted">IP</dt>
                <dd className="font-mono text-xs">{log.ipAddress}</dd>
              </div>
            </dl>

            {log.before ? (
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                  Antes
                </p>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-mu-accent p-4 text-xs text-mu-text">
                  {JSON.stringify(log.before, null, 2)}
                </pre>
              </div>
            ) : null}

            {log.after ? (
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                  Después
                </p>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-mu-accent p-4 text-xs text-mu-text">
                  {JSON.stringify(log.after, null, 2)}
                </pre>
              </div>
            ) : null}

            <p className="mt-4 text-xs text-mu-text-muted">
              {AUDIT_READONLY_NOTICE}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
