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
import { formatDate } from "@/lib/format";
import type { PatientStatus, RecentPatient } from "@/lib/admin/dashboard/types";

interface PatientsTableProps {
  patients?: RecentPatient[];
  isLoading?: boolean;
}

function statusVariant(status: PatientStatus) {
  switch (status) {
    case "active":
      return "success" as const;
    case "pending":
      return "warning" as const;
    default:
      return "muted" as const;
  }
}

function statusLabel(status: PatientStatus) {
  switch (status) {
    case "active":
      return "Activo";
    case "pending":
      return "Pendiente";
    default:
      return "Inactivo";
  }
}

export function PatientsTable({ patients, isLoading }: PatientsTableProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Últimos pacientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = patients ?? [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Últimos pacientes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alias</TableHead>
              <TableHead className="hidden sm:table-cell">Correo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty message="No hay pacientes recientes" />
            ) : (
              rows.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.alias}</TableCell>
                  <TableCell className="hidden sm:table-cell text-mu-text-muted">
                    {patient.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(patient.status)}>
                      {statusLabel(patient.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-mu-text-muted">
                    {formatDate(patient.createdAt)}
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
