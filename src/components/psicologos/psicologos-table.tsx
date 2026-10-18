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
import {
  PSYCHOLOGIST_PLAN_LABELS,
  PSYCHOLOGIST_STATUS_LABELS,
  psychologistStatusVariant,
} from "@/lib/admin/psicologos/labels";
import type { PsychologistListItem } from "@/lib/admin/psicologos/types";

interface PsicologosTableProps {
  psychologists?: PsychologistListItem[];
  isLoading?: boolean;
  selectedId?: string | null;
  page: number;
  pageSize: TablePageSize;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: TablePageSize) => void;
  onView: (id: string) => void;
  onEdit: (psychologist: PsychologistListItem) => void;
  onChangePassword: (id: string) => void;
}

export function PsicologosTable({
  psychologists,
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
}: PsicologosTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Psicólogos registrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = psychologists ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Psicólogos registrados</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Especialidad</TableHead>
              <TableHead className="hidden lg:table-cell">Experiencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden sm:table-cell">Plan</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty message="No hay psicólogos registrados. Aparecerán aquí cuando se registren en la plataforma." />
            ) : (
              rows.map((psychologist) => (
                <TableRow
                  key={psychologist.id}
                  data-state={selectedId === psychologist.id ? "selected" : undefined}
                  className="data-[state=selected]:bg-mu-accent/90"
                >
                  <TableCell className="font-medium">
                    {psychologist.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {psychologist.specialty}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-mu-text-muted">
                    {psychologist.experienceYears} años
                  </TableCell>
                  <TableCell>
                    <Badge variant={psychologistStatusVariant(psychologist.status)}>
                      {PSYCHOLOGIST_STATUS_LABELS[psychologist.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-mu-text-muted">
                    {PSYCHOLOGIST_PLAN_LABELS[psychologist.plan]}
                  </TableCell>
                  <TableCell>
                    <TableRowActions
                      onView={() => onView(psychologist.id)}
                      onEdit={() => onEdit(psychologist)}
                      onChangePassword={() => onChangePassword(psychologist.id)}
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
