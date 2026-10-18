"use client";

import { Skeleton } from "@/components/admin/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { IA_STAT_CARDS } from "@/lib/admin/ia-administrativa/labels";
import type { IaAlertType, IaStats } from "@/lib/admin/ia-administrativa/types";
import { cn } from "@/lib/utils";

interface IaStatCardsProps {
  stats?: IaStats;
  isLoading?: boolean;
  activeType?: IaAlertType | "all";
  onTypeClick?: (type: IaAlertType) => void;
}

export function IaStatCards({
  stats,
  isLoading,
  activeType,
  onTypeClick,
}: IaStatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {IA_STAT_CARDS.map((card) => (
          <Skeleton key={card.key} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {IA_STAT_CARDS.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;
        const isActive = activeType === card.type;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onTypeClick?.(card.type)}
            className={cn(
              "rounded-xl border bg-white p-4 text-left shadow-sm transition-colors",
              isActive
                ? "border-mu-primary ring-2 ring-mu-primary/20"
                : "border-mu-border hover:border-mu-primary/30",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                  {card.label}
                </p>
                <p className="mt-2 font-heading text-2xl font-semibold text-mu-text">
                  {formatNumber(value)}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mu-accent text-mu-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
