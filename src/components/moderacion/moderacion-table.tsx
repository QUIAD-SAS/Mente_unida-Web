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
  MODERATION_REASON_LABELS,
  MODERATION_STATUS_LABELS,
  moderationStatusVariant,
} from "@/lib/admin/moderacion/labels";
import type { ModerationListItem } from "@/lib/admin/moderacion/types";
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  Eye,
  EyeOff,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

interface ModeracionTableProps {
  items?: ModerationListItem[];
  isLoading?: boolean;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onHide: (id: string) => void;
  onWarn: (id: string) => void;
}

export function ModeracionTable({
  items,
  isLoading,
  selectedId,
  onSelect,
  onApprove,
  onDelete,
  onHide,
  onWarn,
}: ModeracionTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cola de moderación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cola de moderación</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Publicación</TableHead>
              <TableHead className="hidden sm:table-cell">Usuario</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead className="hidden md:table-cell">IA</TableHead>
              <TableHead className="hidden lg:table-cell">Fecha</TableHead>
              <TableHead className="hidden xl:table-cell">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty message="No hay casos de moderación pendientes." />
            ) : (
              rows.map((item) => (
                <TableRow
                  key={item.id}
                  data-state={selectedId === item.id ? "selected" : undefined}
                  className="cursor-pointer data-[state=selected]:bg-mu-accent/90"
                  onClick={() => onSelect(item.id)}
                >
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {item.publicationTitle}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {item.userName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning" className="text-[10px]">
                      {MODERATION_REASON_LABELS[item.reason]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.aiFlagged ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-mu-primary">
                        <Bot className="h-3.5 w-3.5" />
                        {item.aiConfidence != null
                          ? `${Math.round(item.aiConfidence * 100)}%`
                          : "Sí"}
                      </span>
                    ) : (
                      <span className="text-xs text-mu-text-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-mu-text-muted">
                    {formatDateTime(item.createdAt)}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <Badge variant={moderationStatusVariant(item.status)}>
                      {MODERATION_STATUS_LABELS[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
                          onSelect={() => onSelect(item.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => onApprove(item.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprobar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => onHide(item.id)}
                        >
                          <EyeOff className="mr-2 h-4 w-4" />
                          Ocultar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-mu-error focus:text-mu-error"
                          onSelect={() => onDelete(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => onWarn(item.id)}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Advertir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
