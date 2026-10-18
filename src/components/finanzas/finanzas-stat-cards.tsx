"use client";

import { Skeleton } from "@/components/admin/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { FinanzasStats } from "@/lib/admin/finanzas/types";
import { TrendingDown, TrendingUp, UserCheck, Users } from "lucide-react";

interface FinanzasStatCardsProps {
  stats?: FinanzasStats;
  isLoading?: boolean;
}

const CARDS = [
  {
    key: "monthlyRevenue" as const,
    label: "Ingresos mes",
    icon: TrendingUp,
    format: formatCurrency,
  },
  {
    key: "activePsychologists" as const,
    label: "Psicólogos activos",
    icon: UserCheck,
    format: formatNumber,
  },
  {
    key: "activePatients" as const,
    label: "Pacientes",
    icon: Users,
    format: formatNumber,
  },
  {
    key: "cancellations" as const,
    label: "Cancelaciones",
    icon: TrendingDown,
    format: formatNumber,
  },
];

export function FinanzasStatCards({ stats, isLoading }: FinanzasStatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((card) => (
          <Skeleton key={card.key} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;

        return (
          <div
            key={card.key}
            className="rounded-xl border border-mu-border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                  {card.label}
                </p>
                <p className="mt-2 font-heading text-2xl font-semibold text-mu-text">
                  {card.format(value)}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mu-accent text-mu-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
