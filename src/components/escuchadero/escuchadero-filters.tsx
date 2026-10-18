"use client";

import { Input } from "@/components/admin/ui/input";
import { cn } from "@/lib/utils";
import {
  ESCUCHADERO_PRIORITY_LABELS,
  ESCUCHADERO_STATUS_LABELS,
} from "@/lib/admin/escuchadero/labels";
import type {
  EscuchaderoFilters,
  EscuchaderoPriority,
  EscuchaderoStatus,
} from "@/lib/admin/escuchadero/types";
import { Search } from "lucide-react";

interface EscuchaderoFiltersBarProps {
  filters: EscuchaderoFilters;
  onChange: (filters: EscuchaderoFilters) => void;
}

const STATUS_OPTIONS: Array<EscuchaderoStatus | "all"> = [
  "all",
  "pending",
  "in_review",
  "escalated",
  "responded",
  "closed",
];

const PRIORITY_OPTIONS: Array<EscuchaderoPriority | "all"> = [
  "all",
  "low",
  "medium",
  "high",
  "critical",
];

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

export function EscuchaderoFiltersBar({
  filters,
  onChange,
}: EscuchaderoFiltersBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mu-text-muted" />
        <Input
          type="search"
          placeholder="Buscar por alias o asunto…"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-10 pl-10"
          aria-label="Buscar mensajes"
        />
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
              status === "all"
                ? "Todos"
                : ESCUCHADERO_STATUS_LABELS[status]
            }
            onClick={() => onChange({ ...filters, status })}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="mr-1 self-center text-xs font-medium uppercase tracking-wide text-mu-text-muted">
          Prioridad:
        </span>
        {PRIORITY_OPTIONS.map((priority) => (
          <FilterChip
            key={priority}
            active={(filters.priority ?? "all") === priority}
            label={
              priority === "all"
                ? "Todas"
                : ESCUCHADERO_PRIORITY_LABELS[priority]
            }
            onClick={() => onChange({ ...filters, priority })}
          />
        ))}
      </div>
    </div>
  );
}
