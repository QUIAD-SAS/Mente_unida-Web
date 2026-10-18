"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
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
import { AUDIT_MODULE_LABELS } from "@/lib/admin/auditoria/labels";
import type { AuditLogListItem } from "@/lib/admin/auditoria/types";

interface AuditoriaTableProps {
  logs?: AuditLogListItem[];
  isLoading?: boolean;
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

export function AuditoriaTable({
  logs,
  isLoading,
  selectedId,
  onSelect,
}: AuditoriaTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registro de acciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = logs ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de acciones</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead className="hidden sm:table-cell">Módulo</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead className="hidden lg:table-cell">IP</TableHead>
              <TableHead className="hidden xl:table-cell">Antes</TableHead>
              <TableHead className="hidden xl:table-cell">Después</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty message="No hay registros de auditoría en este momento." />
            ) : (
              rows.map((log) => (
                <TableRow
                  key={log.id}
                  data-state={selectedId === log.id ? "selected" : undefined}
                  className="cursor-pointer data-[state=selected]:bg-mu-accent/90"
                  onClick={() => onSelect(log.id)}
                >
                  <TableCell className="font-medium">{log.userName}</TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {log.action}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="default" className="text-[10px]">
                      {AUDIT_MODULE_LABELS[log.module]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-mu-text-muted">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-xs text-mu-text-muted">
                    {log.ipAddress}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell max-w-[120px] truncate text-mu-text-muted">
                    {log.beforeSummary ?? "—"}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell max-w-[120px] truncate text-mu-text-muted">
                    {log.afterSummary ?? "—"}
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
