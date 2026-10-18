"use client";

import { Input } from "@/components/admin/ui/input";
import {
  IA_ALERT_STATUS_LABELS,
  IA_ALERT_TYPE_LABELS,
  IA_DISCLAIMER,
  IA_EXAMPLES,
  BotIcon,
} from "@/lib/admin/ia-administrativa/labels";
import type { IaAlertStatus, IaAlertType, IaFilters } from "@/lib/admin/ia-administrativa/types";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface IaFiltersBarProps {
  filters: IaFilters;
  onChange: (filters: IaFilters) => void;
}

const TYPE_OPTIONS: Array<IaAlertType | "all"> = [
  "all",
  "sensitive_post",
  "critical_message",
  "poor_anonymization",
  "pending_payment",
  "unvalidated_psychologist",
];

const STATUS_OPTIONS: Array<IaAlertStatus | "all"> = [
  "all",
  "pending",
  "reviewed",
  "ignored",
  "approved",
  "escalated",
];

export function IaFiltersBar({ filters, onChange }: IaFiltersBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-mu-primary/20 bg-mu-accent px-4 py-3">
        <BotIcon className="mt-0.5 h-4 w-4 shrink-0 text-mu-primary" />
        <div>
          <p className="text-sm font-medium text-mu-text">{IA_DISCLAIMER}</p>
          <p className="mt-1 text-xs text-mu-text-muted">
            Ejemplos detectables: {IA_EXAMPLES.join(" · ")}
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mu-text-muted" />
        <Input
          type="search"
          placeholder="Buscar por usuario o motivo…"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-10 pl-10"
          aria-label="Buscar alertas IA"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="mr-1 self-center text-xs font-medium uppercase tracking-wide text-mu-text-muted">
          Tipo:
        </span>
        {TYPE_OPTIONS.map((type) => (
          <FilterChip
            key={type}
            active={(filters.type ?? "all") === type}
            label={type === "all" ? "Todos" : IA_ALERT_TYPE_LABELS[type]}
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
              status === "all" ? "Todos" : IA_ALERT_STATUS_LABELS[status]
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
