"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Skeleton } from "@/components/admin/ui/skeleton";
import type { DashboardAlert } from "@/lib/admin/dashboard/types";
import {
  AlertTriangle,
  CreditCard,
  Flag,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

interface AlertsPanelProps {
  alerts?: DashboardAlert[];
  isLoading?: boolean;
}

const ALERT_ICONS: Record<DashboardAlert["type"], LucideIcon> = {
  reported_posts: Flag,
  critical_messages: AlertTriangle,
  pending_payments: CreditCard,
  pending_psychologists: UserPlus,
};

export function AlertsPanel({ alerts, isLoading }: AlertsPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const items = alerts ?? [];

  const defaultAlerts: DashboardAlert[] = [
    {
      id: "reported_posts",
      type: "reported_posts",
      title: "Publicaciones reportadas",
      count: 0,
      href: "/dashboard/moderacion",
    },
    {
      id: "critical_messages",
      type: "critical_messages",
      title: "Mensajes críticos",
      count: 0,
      href: "/dashboard/escuchadero",
    },
    {
      id: "pending_payments",
      type: "pending_payments",
      title: "Pagos pendientes",
      count: 0,
      href: "/dashboard/finanzas",
    },
    {
      id: "pending_psychologists",
      type: "pending_psychologists",
      title: "Psicólogos pendientes",
      count: 0,
      href: "/dashboard/solicitudes",
    },
  ];

  const displayAlerts = items.length > 0 ? items : defaultAlerts;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {displayAlerts.map((alert) => {
          const Icon = ALERT_ICONS[alert.type];

          return (
            <Link
              key={alert.id}
              href={alert.href}
              className="flex items-center gap-4 rounded-xl border border-mu-border bg-mu-accent/60 p-4 transition-colors hover:border-mu-primary/30 hover:bg-mu-accent/80"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-mu-primary shadow-sm">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-mu-text">{alert.title}</p>
                <p className="mt-0.5 text-xs text-mu-text-muted">
                  {alert.count > 0
                    ? `${alert.count} pendiente${alert.count === 1 ? "" : "s"}`
                    : "Sin pendientes"}
                </p>
              </div>
              {alert.count > 0 ? (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-mu-primary px-1.5 text-xs font-semibold text-white">
                  {alert.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
