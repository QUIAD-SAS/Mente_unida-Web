"use client";

import { Input } from "@/components/admin/ui/input";
import {
  MODERATION_REASON_FILTERS,
  MODERATION_REASON_LABELS,
  MODERATION_STATUS_LABELS,
} from "@/lib/admin/moderacion/labels";
import type { ModerationFilters, ModerationStatus } from "@/lib/admin/moderacion/types";
import { cn } from "@/lib/utils";
import { Bot, Search } from "lucide-react";

interface ModeracionFiltersBarProps {
  filters: ModerationFilters;
  onChange: (filters: ModerationFilters) => void;
}

const STATUS_OPTIONS: Array<ModerationStatus | "all"> = [
  "all",
  "pending",
  "approved",
  "hidden",
  "removed",
];

export function ModeracionFiltersBar({
  filters,
  onChange,
}: ModeracionFiltersBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mu-text-muted" />
          <Input
            type="search"
            placeholder="Buscar publicación o usuario…"
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-10 pl-10"
            aria-label="Buscar casos de moderación"
          />
        </div>

        <button
          type="button"
          onClick={() => onChange({ ...filters, aiOnly: !filters.aiOnly })}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors",
            filters.aiOnly
              ? "bg-mu-primary text-white"
              : "bg-white text-mu-text-muted hover:bg-mu-accent",
          )}
        >
          <Bot className="h-3.5 w-3.5" />
          Solo detectados por IA
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="mr-1 self-center text-xs font-medium uppercase tracking-wide text-mu-text-muted">
          Motivo:
        </span>
        {MODERATION_REASON_FILTERS.map((reason) => (
          <FilterChip
            key={reason}
            active={(filters.reason ?? "all") === reason}
            label={reason === "all" ? "Todos" : MODERATION_REASON_LABELS[reason]}
            onClick={() => onChange({ ...filters, reason })}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="mr-1 self-center text-xs font-medium uppercase tracking-wide text-mu-text-muted">
          Estado:
        </span>
        {STATUS_OPTIONS.map((status) => (
          <FilterChip
            key={status}
            active={(filters.status ?? "all") === status}
            label={
              status === "all" ? "Todos" : MODERATION_STATUS_LABELS[status]
            }
            onClick={() => onChange({ ...filters, status })}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-mu-primary text-white"
          : "bg-white text-mu-text-muted hover:bg-mu-accent",
      )}
    >
      {label}
    </button>
  );
}
