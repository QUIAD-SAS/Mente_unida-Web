"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
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
import { formatDate } from "@/lib/format";
import type { RecentRequest, RequestStatus } from "@/lib/admin/dashboard/types";
import Link from "next/link";

interface RequestsTableProps {
  requests?: RecentRequest[];
  isLoading?: boolean;
}

function statusVariant(status: RequestStatus) {
  switch (status) {
    case "approved":
      return "success" as const;
    case "rejected":
      return "danger" as const;
    case "review":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

function statusLabel(status: RequestStatus) {
  switch (status) {
    case "approved":
      return "Aprobada";
    case "rejected":
      return "Rechazada";
    case "review":
      return "En revisión";
    default:
      return "Pendiente";
  }
}

export function RequestsTable({ requests, isLoading }: RequestsTableProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Últimas solicitudes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = requests ?? [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Últimas solicitudes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Psicólogo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden sm:table-cell">Fecha</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty message="No hay solicitudes recientes" />
            ) : (
              rows.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.psychologistName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(request.status)}>
                      {statusLabel(request.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-mu-text-muted">
                    {formatDate(request.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/solicitudes/${request.id}`}>
                        Ver
                      </Link>
                    </Button>
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
