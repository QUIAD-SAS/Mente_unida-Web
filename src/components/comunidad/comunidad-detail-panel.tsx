"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import {
  COMMUNITY_STATUS_LABELS,
  COMMUNITY_TYPE_LABELS,
  communityStatusVariant,
} from "@/lib/admin/comunidad/labels";
import type { CommunityPostDetail } from "@/lib/admin/comunidad/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Ban,
  EyeOff,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";

interface ComunidadDetailPanelProps {
  open: boolean;
  post?: CommunityPostDetail;
  isLoading?: boolean;
  isError?: boolean;
  onClose: () => void;
  onHide: () => void;
  onDelete: () => void;
  onWarn: () => void;
  onSuspend: () => void;
}

export function ComunidadDetailPanel({
  open,
  post,
  isLoading,
  isError,
  onClose,
  onHide,
  onDelete,
  onWarn,
  onSuspend,
}: ComunidadDetailPanelProps) {
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
        aria-label="Detalle de publicación"
        aria-hidden={!open}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-mu-border px-5">
          <h2 className="font-heading text-base font-semibold text-mu-text">
            Publicación
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
        ) : isError || !post ? (
          <div className="flex flex-1 items-center justify-center p-5 text-sm text-mu-text-muted">
            No se pudo cargar la publicación.
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">
                  {COMMUNITY_TYPE_LABELS[post.type]}
                </Badge>
                <Badge variant={communityStatusVariant(post.status)}>
                  {COMMUNITY_STATUS_LABELS[post.status]}
                </Badge>
              </div>

              <h3 className="mt-4 font-heading text-lg font-semibold text-mu-text">
                {post.title}
              </h3>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-mu-text-muted">
                <span>Autor: {post.authorName}</span>
                <span>{formatDateTime(post.createdAt)}</span>
              </div>

              <div className="mt-4 flex gap-4 text-sm">
                <span className="text-mu-error">
                  {post.reportsCount} reporte{post.reportsCount === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1 text-mu-text-muted">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {post.commentsCount} comentarios
                </span>
              </div>

              <div className="mt-6 rounded-xl bg-mu-accent p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-mu-text">
                  {post.content || "Sin contenido disponible."}
                </p>
              </div>
            </div>

            <div className="shrink-0 border-t border-mu-border p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                Acciones
              </p>
              <div className="grid grid-cols-2 gap-2">
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
                <Button type="button" variant="outline" size="sm" onClick={onSuspend}>
                  <Ban className="h-4 w-4" />
                  Suspender
                </Button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
