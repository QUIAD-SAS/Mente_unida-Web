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
import { formatDateTime } from "@/lib/format";
import {
  ESCUCHADERO_PRIORITY_LABELS,
  ESCUCHADERO_STATUS_LABELS,
  priorityBadgeVariant,
  statusBadgeVariant,
} from "@/lib/admin/escuchadero/labels";
import type { EscuchaderoMessageListItem } from "@/lib/admin/escuchadero/types";
import { Eye, MessageCircle } from "lucide-react";

interface EscuchaderoMessagesTableProps {
  messages?: EscuchaderoMessageListItem[];
  isLoading?: boolean;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onOpenChat: (id: string) => void;
}

export function EscuchaderoMessagesTable({
  messages,
  isLoading,
  selectedId,
  onSelect,
  onOpenChat,
}: EscuchaderoMessagesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mensajes del Escuchadero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = messages ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mensajes del Escuchadero</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alias</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead className="hidden sm:table-cell">Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Asignado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty message="No hay mensajes del escuchadero. Aparecerán aquí cuando los pacientes envíen solicitudes desde la plataforma." />
            ) : (
              rows.map((message) => (
                <TableRow
                  key={message.id}
                  data-state={selectedId === message.id ? "selected" : undefined}
                  className="cursor-pointer data-[state=selected]:bg-mu-accent/90"
                  onClick={() => onSelect(message.id)}
                >
                  <TableCell className="font-medium">{message.alias}</TableCell>
                  <TableCell className="hidden md:table-cell text-mu-text-muted">
                    {formatDateTime(message.createdAt)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {message.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityBadgeVariant(message.priority)}>
                      {ESCUCHADERO_PRIORITY_LABELS[message.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={statusBadgeVariant(message.status)}>
                      {ESCUCHADERO_STATUS_LABELS[message.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-mu-text-muted">
                    {message.assignedTo ?? "Sin asignar"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(message.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">
                          Detalle
                        </span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChat(message.id);
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">
                          Conversar
                        </span>
                      </Button>
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
