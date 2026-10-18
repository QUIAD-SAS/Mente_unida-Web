"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Input } from "@/components/admin/ui/input";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import {
  SOPORTE_STATUS_LABELS,
  soporteStatusVariant,
} from "@/lib/admin/soporte/labels";
import type { SoporteConversation, SoporteFilters } from "@/lib/admin/soporte/types";
import { cn } from "@/lib/utils";
import { MessageSquare, Search, Ticket } from "lucide-react";

interface SoporteConversationsSidebarProps {
  conversations?: SoporteConversation[];
  isLoading?: boolean;
  selectedId?: string | null;
  filters: SoporteFilters;
  onFiltersChange: (filters: SoporteFilters) => void;
  onSelect: (id: string) => void;
  className?: string;
}

const STATUS_FILTERS: Array<SoporteFilters["status"]> = [
  "all",
  "open",
  "pending",
  "resolved",
  "escalated",
  "closed",
];

export function SoporteConversationsSidebar({
  conversations,
  isLoading,
  selectedId,
  filters,
  onFiltersChange,
  onSelect,
  className,
}: SoporteConversationsSidebarProps) {
  const rows = conversations ?? [];

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-mu-border bg-white",
        className,
      )}
    >
      <div className="border-b border-mu-border p-4">
        <h2 className="font-heading text-sm font-semibold text-mu-text">
          Conversaciones
        </h2>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mu-text-muted" />
          <Input
            type="search"
            placeholder="Buscar…"
            value={filters.search ?? ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="h-9 pl-9 text-sm"
            aria-label="Buscar conversaciones"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status ?? "all"}
              type="button"
              onClick={() => onFiltersChange({ ...filters, status })}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                (filters.status ?? "all") === status
                  ? "bg-mu-primary text-white"
                  : "bg-mu-accent text-mu-text-muted hover:text-mu-text",
              )}
            >
              {status === "all" ? "Todos" : SOPORTE_STATUS_LABELS[status!]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-4 text-center">
            <MessageSquare className="h-8 w-8 text-mu-text-muted/50" />
            <p className="mt-3 text-sm text-mu-text-muted">
              No hay conversaciones activas
            </p>
          </div>
        ) : (
          <ul className="p-2">
            {rows.map((conversation) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className={cn(
                    "w-full rounded-xl px-3 py-3 text-left transition-colors",
                    selectedId === conversation.id
                      ? "bg-mu-accent"
                      : "hover:bg-mu-accent/80",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-mu-text">
                          {conversation.userAlias}
                        </p>
                        {conversation.isTicket ? (
                          <Ticket className="h-3.5 w-3.5 shrink-0 text-mu-primary" />
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-mu-text-muted">
                        {conversation.subject}
                      </p>
                      <p className="mt-1 truncate text-xs text-mu-text-muted">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[10px] text-mu-text-muted">
                        {formatDateTime(conversation.lastMessageAt)}
                      </span>
                      {conversation.unreadCount > 0 ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-mu-primary px-1 text-[10px] font-semibold text-white">
                          {conversation.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant={soporteStatusVariant(conversation.status)}
                      className="text-[10px]"
                    >
                      {SOPORTE_STATUS_LABELS[conversation.status]}
                    </Badge>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
