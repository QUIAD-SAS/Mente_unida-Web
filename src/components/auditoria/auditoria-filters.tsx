"use client";

import { Input } from "@/components/admin/ui/input";
import {
  AUDIT_MODULE_FILTERS,
  AUDIT_MODULE_LABELS,
  AUDIT_READONLY_NOTICE,
} from "@/lib/admin/auditoria/labels";
import type { AuditFilters } from "@/lib/admin/auditoria/types";
import { cn } from "@/lib/utils";
import { Lock, Search } from "lucide-react";

interface AuditoriaFiltersBarProps {
  filters: AuditFilters;
  onChange: (filters: AuditFilters) => void;
}

export function AuditoriaFiltersBar({
  filters,
  onChange,
}: AuditoriaFiltersBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-mu-border bg-mu-accent px-4 py-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-mu-primary" />
        <p className="text-sm text-mu-text-muted">{AUDIT_READONLY_NOTICE}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mu-text-muted" />
          <Input
            type="search"
            placeholder="Buscar por usuario o acción…"
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-10 pl-10"
            aria-label="Buscar registros"
          />
        </div>

        <Input
          type="text"
          placeholder="Filtrar por usuario"
          value={filters.user ?? ""}
          onChange={(e) => onChange({ ...filters, user: e.target.value })}
          className="h-10"
          aria-label="Filtrar por usuario"
        />

        <div className="flex gap-2">
          <Input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) =>
              onChange({ ...filters, dateFrom: e.target.value })
            }
            className="h-10"
            aria-label="Fecha desde"
          />
          <Input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className="h-10"
            aria-label="Fecha hasta"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="mr-1 self-center text-xs font-medium uppercase tracking-wide text-mu-text-muted">
          Módulo:
        </span>
        {AUDIT_MODULE_FILTERS.map((module) => (
          <FilterChip
            key={module}
            active={(filters.module ?? "all") === module}
            label={module === "all" ? "Todos" : AUDIT_MODULE_LABELS[module]}
            onClick={() => onChange({ ...filters, module })}
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
