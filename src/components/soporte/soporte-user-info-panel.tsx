"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { formatDate } from "@/lib/format";
import {
  SOPORTE_STATUS_LABELS,
  soporteStatusVariant,
} from "@/lib/admin/soporte/labels";
import type { SoporteConversationDetail } from "@/lib/admin/soporte/types";
import { cn } from "@/lib/utils";
import { Mail, Ticket, User } from "lucide-react";

interface SoporteUserInfoPanelProps {
  detail?: SoporteConversationDetail;
  isLoading?: boolean;
  onClose?: () => void;
  className?: string;
}

export function SoporteUserInfoPanel({
  detail,
  isLoading,
  onClose,
  className,
}: SoporteUserInfoPanelProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-l border-mu-border bg-white",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-mu-border px-4 py-3">
        <h2 className="font-heading text-sm font-semibold text-mu-text">
          Información del usuario
        </h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-mu-primary hover:underline xl:hidden"
          >
            Cerrar
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !detail ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-center text-sm text-mu-text-muted">
            Selecciona una conversación para ver la información del usuario.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mu-primary text-xl font-semibold text-white">
                {detail.user.alias.charAt(0).toUpperCase()}
              </div>
              <p className="mt-3 font-medium text-mu-text">{detail.user.alias}</p>
              <Badge
                variant={soporteStatusVariant(detail.conversation.status)}
                className="mt-2"
              >
                {SOPORTE_STATUS_LABELS[detail.conversation.status]}
              </Badge>
            </div>

            <InfoRow icon={Mail} label="Correo" value={detail.user.email} />
            <InfoRow icon={User} label="Rol" value={detail.user.role} />
            <InfoRow
              icon={Ticket}
              label="Tickets totales"
              value={String(detail.user.totalTickets)}
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                Registrado
              </p>
              <p className="mt-1 text-sm text-mu-text">
                {formatDate(detail.user.registeredAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                Asunto
              </p>
              <p className="mt-1 text-sm text-mu-text">
                {detail.conversation.subject}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                Tipo
              </p>
              <p className="mt-1 text-sm text-mu-text">
                {detail.conversation.isTicket ? "Ticket formal" : "Chat en vivo"}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mu-accent text-mu-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-mu-text-muted">{label}</p>
        <p className="truncate text-sm font-medium text-mu-text">{value}</p>
      </div>
    </div>
  );
}
