"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Skeleton } from "@/components/admin/ui/skeleton";
import type { WeeklyActivityPoint } from "@/lib/admin/dashboard/types";

interface WeeklyActivityChartProps {
  data?: WeeklyActivityPoint[];
  isLoading?: boolean;
}

const SERIES = [
  { key: "registrations" as const, label: "Registros", color: "#27548A" },
  { key: "subscriptions" as const, label: "Suscripciones", color: "#4A7BA7" },
  { key: "appointments" as const, label: "Citas", color: "#6B9BC4" },
  { key: "revenue" as const, label: "Ingresos", color: "#8BB5D6" },
];

const CHART_HEIGHT = 180;
const BAR_WIDTH = 12;
const GROUP_GAP = 24;

export function WeeklyActivityChart({ data, isLoading }: WeeklyActivityChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[220px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const points = data ?? [];
  const hasData = points.length > 0;

  const maxValue = hasData
    ? Math.max(
        ...points.flatMap((p) => [
          p.registrations,
          p.subscriptions,
          p.appointments,
          Math.round(p.revenue / 1000),
        ]),
        1,
      )
    : 1;

  const chartWidth = Math.max(points.length * GROUP_GAP, 280);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Actividad semanal</CardTitle>
        <div className="flex flex-wrap gap-3">
          {SERIES.map((series) => (
            <div key={series.key} className="flex items-center gap-1.5 text-xs text-mu-text-muted">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              {series.label}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-mu-border bg-mu-accent/80 text-sm text-mu-text-muted">
            Sin datos de actividad disponibles
          </div>
        ) : (
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT + 40}`}
              className="min-w-full"
              role="img"
              aria-label="Gráfico de actividad semanal"
            >
              {points.map((point, index) => {
                const x = index * GROUP_GAP + 16;
                const values = [
                  point.registrations,
                  point.subscriptions,
                  point.appointments,
                  Math.round(point.revenue / 1000),
                ];

                return (
                  <g key={point.day}>
                    {values.map((value, seriesIndex) => {
                      const height = (value / maxValue) * CHART_HEIGHT;
                      const barX = x + seriesIndex * (BAR_WIDTH + 2);

                      return (
                        <rect
                          key={`${point.day}-${seriesIndex}`}
                          x={barX}
                          y={CHART_HEIGHT - height}
                          width={BAR_WIDTH}
                          height={height}
                          rx={3}
                          fill={SERIES[seriesIndex].color}
                          opacity={0.9}
                        />
                      );
                    })}
                    <text
                      x={x + (BAR_WIDTH * 4) / 2}
                      y={CHART_HEIGHT + 24}
                      textAnchor="middle"
                      className="fill-mu-text-muted text-[10px]"
                    >
                      {point.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
