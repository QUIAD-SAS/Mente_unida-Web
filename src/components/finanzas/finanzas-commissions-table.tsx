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
  COMMISSION_STATUS_LABELS,
  commissionStatusVariant,
} from "@/lib/admin/finanzas/labels";
import type { CommissionRow } from "@/lib/admin/finanzas/types";

interface FinanzasCommissionsTableProps {
  commissions?: CommissionRow[];
  isLoading?: boolean;
}

export function FinanzasCommissionsTable({
  commissions,
  isLoading,
}: FinanzasCommissionsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comisiones por psicólogo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = commissions ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comisiones por psicólogo</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Psicólogo</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="hidden sm:table-cell">Comisión</TableHead>
              <TableHead>Ingreso</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty message="No hay comisiones en el periodo seleccionado." />
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.psychologistName}
                  </TableCell>
                  <TableCell className="text-mu-text-muted">{row.plan}</TableCell>
                  <TableCell className="hidden sm:table-cell text-mu-text-muted">
                    {formatCurrency(row.commission)}
                  </TableCell>
                  <TableCell>{formatCurrency(row.income)}</TableCell>
                  <TableCell>
                    <Badge variant={commissionStatusVariant(row.status)}>
                      {COMMISSION_STATUS_LABELS[row.status]}
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
