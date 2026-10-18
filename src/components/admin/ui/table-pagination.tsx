"use client";

import { Button } from "@/components/admin/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const TABLE_PAGE_SIZES = [5, 15, 20] as const;
export type TablePageSize = (typeof TABLE_PAGE_SIZES)[number];

interface TablePaginationProps {
  page: number;
  pageSize: TablePageSize;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: TablePageSize) => void;
}

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-mu-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-mu-text-muted">
        <span>Mostrar</span>
        <select
          value={pageSize}
          onChange={(e) =>
            onPageSizeChange(Number(e.target.value) as TablePageSize)
          }
          className="h-9 rounded-lg border border-mu-border bg-white px-2 text-sm text-mu-text"
          aria-label="Filas por página"
        >
          {TABLE_PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>por página</span>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="text-sm text-mu-text-muted">
          {total === 0
            ? "0 resultados"
            : `${start}–${end} de ${total}`}
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[4.5rem] text-center text-sm text-mu-text">
            {safePage} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    safePage,
  };
}
