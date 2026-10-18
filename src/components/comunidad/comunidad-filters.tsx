"use client";

import { Input } from "@/components/admin/ui/input";
import {
  COMMUNITY_STATUS_LABELS,
  COMMUNITY_TYPE_FILTERS,
  COMMUNITY_TYPE_LABELS,
} from "@/lib/admin/comunidad/labels";
import type { CommunityFilters, CommunityPostStatus } from "@/lib/admin/comunidad/types";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface ComunidadFiltersBarProps {
  filters: CommunityFilters;
  onChange: (filters: CommunityFilters) => void;
}

const STATUS_OPTIONS: Array<CommunityPostStatus | "all"> = [
  "all",
  "published",
  "reported",
  "hidden",
  "removed",
];

export function ComunidadFiltersBar({
  filters,
  onChange,
}: ComunidadFiltersBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mu-text-muted" />
        <Input
          type="search"
          placeholder="Buscar por autor o título…"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-10 pl-10"
          aria-label="Buscar publicaciones"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="mr-1 self-center text-xs font-medium uppercase tracking-wide text-mu-text-muted">
          Tipo:
        </span>
        {COMMUNITY_TYPE_FILTERS.map((type) => (
          <FilterChip
            key={type}
            active={(filters.type ?? "all") === type}
            label={type === "all" ? "Todos" : COMMUNITY_TYPE_LABELS[type]}
            onClick={() => onChange({ ...filters, type })}
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
              status === "all" ? "Todos" : COMMUNITY_STATUS_LABELS[status]
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
