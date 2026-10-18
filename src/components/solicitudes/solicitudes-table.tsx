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
import {
  SOLICITUD_STATUS_LABELS,
  solicitudStatusVariant,
} from "@/lib/admin/solicitudes/labels";
import type { SolicitudListItem } from "@/lib/admin/solicitudes/types";
import { FileText } from "lucide-react";

interface SolicitudesTableProps {
  requests?: SolicitudListItem[];
  isLoading?: boolean;
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

export function SolicitudesTable({
  requests,
  isLoading,
  selectedId,
  onSelect,
}: SolicitudesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de verificación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = requests ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes de verificación</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Experiencia</TableHead>
              <TableHead className="hidden lg:table-cell">Documentos</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty message="No hay solicitudes de verificación. Aparecerán aquí cuando los profesionales se registren." />
            ) : (
              rows.map((request) => (
                <TableRow
                  key={request.id}
                  data-state={selectedId === request.id ? "selected" : undefined}
                  className="cursor-pointer data-[state=selected]:bg-mu-accent/90"
                  onClick={() => onSelect(request.id)}
                >
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-mu-text-muted">
                    {formatDate(request.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={solicitudStatusVariant(request.status)}>
                      {SOLICITUD_STATUS_LABELS[request.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-mu-text-muted">
                    {request.experienceLabel ??
                      `${request.experienceYears} años`}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-mu-text-muted">
                      <FileText className="h-3.5 w-3.5" />
                      {request.documentsCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(request.id);
                      }}
                    >
                      Revisar
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
