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
import { formatCurrency } from "@/lib/format";
import {
  REFUND_STATUS_LABELS,
  refundStatusVariant,
} from "@/lib/admin/finanzas/labels";
import type { RefundRow } from "@/lib/admin/finanzas/types";

interface FinanzasRefundsTableProps {
  refunds?: RefundRow[];
  isLoading?: boolean;
}

export function FinanzasRefundsTable({
  refunds,
  isLoading,
}: FinanzasRefundsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reembolsos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = refunds ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reembolsos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alias</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="hidden md:table-cell">Motivo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty message="No hay reembolsos en el periodo seleccionado." />
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.alias}</TableCell>
                  <TableCell>{formatCurrency(row.amount)}</TableCell>
                  <TableCell className="hidden max-w-[240px] truncate md:table-cell text-mu-text-muted">
                    {row.reason}
                  </TableCell>
                  <TableCell>
                    <Badge variant={refundStatusVariant(row.status)}>
                      {REFUND_STATUS_LABELS[row.status]}
                    </Badge>
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
