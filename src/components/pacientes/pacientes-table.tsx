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
import {
  TablePagination,
  type TablePageSize,
} from "@/components/admin/ui/table-pagination";
import { TableRowActions } from "@/components/admin/ui/table-row-actions";
import { formatDate } from "@/lib/format";
import {
  PATIENT_STATUS_LABELS,
  patientStatusVariant,
} from "@/lib/admin/pacientes/labels";
import type { PatientListItem } from "@/lib/admin/pacientes/types";

interface PacientesTableProps {
  patients?: PatientListItem[];
  isLoading?: boolean;
  selectedId?: string | null;
  page: number;
  pageSize: TablePageSize;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: TablePageSize) => void;
  onView: (id: string) => void;
  onEdit: (patient: PatientListItem) => void;
  onChangePassword: (id: string) => void;
}

export function PacientesTable({
  patients,
  isLoading,
  selectedId,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onChangePassword,
}: PacientesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pacientes registrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = patients ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pacientes registrados</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alias</TableHead>
              <TableHead className="hidden md:table-cell">Nombre</TableHead>
              <TableHead className="hidden lg:table-cell">Correo</TableHead>
              <TableHead className="hidden xl:table-cell">Teléfono</TableHead>
              <TableHead className="hidden 2xl:table-cell">
                Contacto emergencia
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden sm:table-cell">Registro</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty message="No hay pacientes registrados. Aparecerán aquí cuando se registren en la plataforma." />
            ) : (
              rows.map((patient) => (
                <TableRow
                  key={patient.id}
                  data-state={selectedId === patient.id ? "selected" : undefined}
                  className="data-[state=selected]:bg-mu-accent/90"
                >
                  <TableCell className="font-medium">{patient.alias}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {patient.name}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-mu-text-muted">
                    {patient.email}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-mu-text-muted">
                    {patient.phone}
                  </TableCell>
                  <TableCell className="hidden 2xl:table-cell text-mu-text-muted">
                    {patient.emergencyContact}
                  </TableCell>
                  <TableCell>
                    <Badge variant={patientStatusVariant(patient.status)}>
                      {PATIENT_STATUS_LABELS[patient.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-mu-text-muted">
                    {formatDate(patient.registeredAt)}
                  </TableCell>
                  <TableCell>
                    <TableRowActions
                      onView={() => onView(patient.id)}
                      onEdit={() => onEdit(patient)}
                      onChangePassword={() => onChangePassword(patient.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </CardContent>
    </Card>
  );
}
