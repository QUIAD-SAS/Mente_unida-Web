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
import {
  COMMUNITY_STATUS_LABELS,
  COMMUNITY_TYPE_LABELS,
  communityStatusVariant,
} from "@/lib/admin/comunidad/labels";
import type { CommunityPostListItem } from "@/lib/admin/comunidad/types";
import {
  AlertTriangle,
  Ban,
  Eye,
  EyeOff,
  MessageSquare,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

interface ComunidadTableProps {
  posts?: CommunityPostListItem[];
  isLoading?: boolean;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
  onWarn: (id: string) => void;
  onSuspend: (id: string) => void;
}

export function ComunidadTable({
  posts,
  isLoading,
  selectedId,
  onSelect,
  onHide,
  onDelete,
  onWarn,
  onSuspend,
}: ComunidadTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Publicaciones de la comunidad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const rows = posts ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicaciones de la comunidad</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Autor</TableHead>
              <TableHead className="hidden md:table-cell">Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden sm:table-cell">Reportes</TableHead>
              <TableHead className="hidden lg:table-cell">Comentarios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty message="No hay publicaciones en la comunidad." />
            ) : (
              rows.map((post) => (
                <TableRow
                  key={post.id}
                  data-state={selectedId === post.id ? "selected" : undefined}
                  className="cursor-pointer data-[state=selected]:bg-mu-accent/90"
                  onClick={() => onSelect(post.id)}
                >
                  <TableCell className="font-medium">{post.authorName}</TableCell>
                  <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                    {post.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {COMMUNITY_TYPE_LABELS[post.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {post.reportsCount > 0 ? (
                      <span className="font-medium text-mu-error">
                        {post.reportsCount}
                      </span>
                    ) : (
                      <span className="text-mu-text-muted">0</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-mu-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.commentsCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={communityStatusVariant(post.status)}>
                      {COMMUNITY_STATUS_LABELS[post.status]}
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
                          onSelect={() => onSelect(post.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => onHide(post.id)}
                        >
                          <EyeOff className="mr-2 h-4 w-4" />
                          Ocultar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-mu-error focus:text-mu-error"
                          onSelect={() => onDelete(post.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => onWarn(post.id)}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Advertir
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => onSuspend(post.id)}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Suspender
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
