"use client";

import { Input } from "@/components/admin/ui/input";
import { PSYCHOLOGIST_STATUS_LABELS } from "@/lib/admin/psicologos/labels";
import type { PsychologistFilters, PsychologistStatus } from "@/lib/admin/psicologos/types";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface PsicologosFiltersBarProps {
  filters: PsychologistFilters;
  onChange: (filters: PsychologistFilters) => void;
}

const STATUS_OPTIONS: Array<PsychologistStatus | "all"> = [
  "all",
  "approved",
  "supervisor",
  "rejected",
];

export function PsicologosFiltersBar({
  filters,
  onChange,
}: PsicologosFiltersBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mu-text-muted" />
        <Input
          type="search"
          placeholder="Buscar por nombre, especialidad o licencia…"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-10 pl-10"
          aria-label="Buscar psicólogos"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onChange({ ...filters, status })}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              (filters.status ?? "all") === status
                ? "bg-mu-primary text-white"
                : "bg-white text-mu-text-muted hover:bg-mu-accent",
            )}
          >
            {status === "all" ? "Todos" : PSYCHOLOGIST_STATUS_LABELS[status]}
          </button>
        ))}
      </div>
    </div>
  );
}
