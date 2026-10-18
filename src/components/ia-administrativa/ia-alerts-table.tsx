"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { Skeleton } from "@/components/admin/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { formatDateTime } from "@/lib/format";
import {
  BotIcon,
  IA_ALERT_STATUS_LABELS,
  IA_ALERT_TYPE_LABELS,
  confidenceColor,
  iaStatusVariant,
} from "@/lib/admin/ia-administrativa/labels";
import type { IaAlertListItem } from "@/lib/admin/ia-administrativa/types";
import {
  ArrowUpRight,
  CheckCircle,
  Eye,
  MoreHorizontal,
  XCircle,
} from "lucide-react";

interface IaAlertsTableProps {
  alerts?: IaAlertListItem[];
  isLoading?: boolean;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onReview: (id: string) => void;
  onIgnore: (id: string) => void;
  onApprove: (id: string) => void;
  onEscalate: (id: string) => void;
}

export function IaAlertsTable({
  alerts,
  isLoading,
  selectedId,
  onSelect,
  onReview,
  onIgnore,
  onApprove,
  onEscalate,
}: IaAlertsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas sugeridas por IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = alerts ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas sugeridas por IA</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden sm:table-cell">Usuario</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead className="hidden md:table-cell">Confianza IA</TableHead>
              <TableHead className="hidden lg:table-cell">Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty message="No hay alertas de IA en este momento." />
            ) : (
              rows.map((alert) => (
                <TableRow
                  key={alert.id}
                  data-state={selectedId === alert.id ? "selected" : undefined}
                  className="cursor-pointer data-[state=selected]:bg-mu-accent/90"
                  onClick={() => onSelect(alert.id)}
                >
                  <TableCell>
                    <Badge variant="default" className="text-[10px]">
                      {IA_ALERT_TYPE_LABELS[alert.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell font-medium">
                    {alert.userName}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-mu-text-muted">
                    {alert.reason}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${confidenceColor(alert.aiConfidence)}`}
                    >
                      <BotIcon className="h-3.5 w-3.5" />
                      {Math.round(alert.aiConfidence * 100)}%
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-mu-text-muted">
                    {formatDateTime(alert.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Badge
                        variant={iaStatusVariant(alert.status)}
                        className="hidden xl:inline-flex"
                      >
                        {IA_ALERT_STATUS_LABELS[alert.status]}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Acciones"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => onReview(alert.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Revisar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => onIgnore(alert.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Ignorar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => onApprove(alert.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Aprobar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => onEscalate(alert.id)}
                          >
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Escalar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
