"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Input } from "@/components/admin/ui/input";
import { Skeleton } from "@/components/admin/ui/skeleton";
import {
  ESCUCHADERO_STATUS_LABELS,
  statusBadgeVariant,
} from "@/lib/admin/escuchadero/labels";
import type {
  EscuchaderoFilters,
  EscuchaderoMessageListItem,
} from "@/lib/admin/escuchadero/types";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

function initials(alias: string) {
  return alias
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "P";
}

function relativeTime(iso: string, now: number) {
  const diff = now - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface EscuchaderoInboxListProps {
  conversations?: EscuchaderoMessageListItem[];
  isLoading?: boolean;
  selectedId: string | null;
  filters: EscuchaderoFilters;
  onFiltersChange: (filters: EscuchaderoFilters) => void;
  onSelect: (id: string) => void;
  className?: string;
}

export function EscuchaderoInboxList({
  conversations,
  isLoading,
  selectedId,
  filters,
  onFiltersChange,
  onSelect,
  className,
}: EscuchaderoInboxListProps) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const rows = conversations ?? [];
  const pending = rows.filter((c) => c.unreadCount > 0);
  const rest = rows.filter((c) => c.unreadCount === 0);

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col border-r border-mu-border bg-white",
        className,
      )}
    >
      <div className="shrink-0 space-y-3 border-b border-mu-border p-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-mu-text">
            Mensajes
          </h2>
          <p className="text-xs text-mu-text-muted">
            Pacientes en el escuchadero
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mu-text-muted" />
          <Input
            type="search"
            value={filters.search ?? ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            placeholder="Buscar…"
            className="h-11 rounded-2xl border-0 bg-mu-accent pl-10"
            aria-label="Buscar conversaciones"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {(
            [
              { value: "all", label: "Todos" },
              { value: "pending", label: "Pendientes" },
              { value: "responded", label: "Respondidos" },
              { value: "closed", label: "Cerrados" },
            ] as const
          ).map((tab) => {
            const active = (filters.status ?? "all") === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() =>
                  onFiltersChange({ ...filters, status: tab.value })
                }
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-mu-primary text-white"
                    : "bg-mu-accent text-mu-text-muted hover:text-mu-text",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-mu-border px-4 py-10 text-center text-sm text-mu-text-muted">
            No hay conversaciones todavía. Aparecerán cuando un paciente escriba
            desde la app.
          </p>
        ) : (
          <div className="space-y-4">
            {pending.length > 0 ? (
              <section>
                <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-mu-text-muted">
                  Nuevos
                </h3>
                <ul className="space-y-1">
                  {pending.map((item) => (
                    <ConversationRow
                      key={item.id}
                      item={item}
                      selected={selectedId === item.id}
                      now={now}
                      onSelect={onSelect}
                    />
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-mu-text-muted">
                Conversaciones
              </h3>
              <ul className="space-y-1">
                {(pending.length > 0 ? rest : rows).map((item) => (
                  <ConversationRow
                    key={item.id}
                    item={item}
                    selected={selectedId === item.id}
                    now={now}
                    onSelect={onSelect}
                  />
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </aside>
  );
}

function ConversationRow({
  item,
  selected,
  now,
  onSelect,
}: {
  item: EscuchaderoMessageListItem;
  selected: boolean;
  now: number | null;
  onSelect: (id: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className={cn(
          "flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
          selected ? "bg-mu-primary/10" : "hover:bg-mu-accent",
        )}
      >
        <span
          className={cn(
            "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
            selected ? "bg-mu-primary" : "bg-mu-sidebar",
          )}
          aria-hidden
        >
          {initials(item.alias)}
          {item.unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-mu-error" />
          ) : null}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "truncate text-sm",
                item.unreadCount > 0
                  ? "font-semibold text-mu-text"
                  : "font-medium text-mu-text",
              )}
            >
              {item.alias}
            </span>
            <span className="shrink-0 text-[11px] text-mu-text-muted">
              {now
                ? relativeTime(item.updatedAt || item.createdAt, now)
                : ""}
            </span>
          </span>
          <span className="mt-0.5 flex items-center justify-between gap-2">
            <span className="truncate text-xs text-mu-text-muted">
              {item.subject}
            </span>
            {item.unreadCount > 0 ? (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-mu-primary px-1.5 text-[10px] font-semibold text-white">
                {item.unreadCount > 9 ? "9+" : item.unreadCount}
              </span>
            ) : (
              <Badge
                variant={statusBadgeVariant(item.status)}
                className="hidden shrink-0 sm:inline-flex"
              >
                {ESCUCHADERO_STATUS_LABELS[item.status]}
              </Badge>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}
