"use client";

import { StatCard, StatCardSkeleton } from "@/components/admin/stat-card";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { DashboardStats } from "@/lib/admin/dashboard/types";
import {
  Bot,
  ClipboardList,
  Headphones,
  MessageSquare,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

interface StatCardsGridProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

const STAT_CONFIG = [
  { key: "activeUsers" as const, label: "Usuarios activos", icon: Users, format: formatNumber },
  {
    key: "verifiedPsychologists" as const,
    label: "Psicólogos verificados",
    icon: UserCheck,
    format: formatNumber,
  },
  {
    key: "pendingRequests" as const,
    label: "Solicitudes pendientes",
    icon: ClipboardList,
    format: formatNumber,
  },
  {
    key: "escuchaderoMessages" as const,
    label: "Mensajes Escuchadero",
    icon: MessageSquare,
    format: formatNumber,
  },
  {
    key: "supportTickets" as const,
    label: "Tickets soporte",
    icon: Headphones,
    format: formatNumber,
  },
  { key: "aiAlerts" as const, label: "Alertas IA", icon: Bot, format: formatNumber },
  {
    key: "monthlyRevenue" as const,
    label: "Ingresos mes",
    icon: Wallet,
    format: formatCurrency,
  },
];

export function StatCardsGrid({ stats, isLoading }: StatCardsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {STAT_CONFIG.map((item) => (
          <StatCardSkeleton key={item.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
      {STAT_CONFIG.map((item) => {
        const Icon = item.icon;
        const raw = stats?.[item.key] ?? 0;

        return (
          <StatCard
            key={item.key}
            label={item.label}
            value={item.format(raw)}
            icon={Icon}
          />
        );
      })}
    </div>
  );
}
