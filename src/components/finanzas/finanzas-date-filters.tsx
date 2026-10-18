"use client";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import type { FinanzasFilters } from "@/lib/admin/finanzas/types";
import { Download } from "lucide-react";

interface FinanzasDateFiltersProps {
  filters: FinanzasFilters;
  onChange: (filters: FinanzasFilters) => void;
  onDownloadPdf: () => void;
  isDownloading?: boolean;
}

export function FinanzasDateFilters({
  filters,
  onChange,
  onDownloadPdf,
  isDownloading,
}: FinanzasDateFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-mu-border bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <Label htmlFor="date-from" className="text-xs">
            Desde
          </Label>
          <Input
            id="date-from"
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) =>
              onChange({ ...filters, dateFrom: e.target.value || undefined })
            }
            className="mt-1.5 h-10"
          />
        </div>
        <div>
          <Label htmlFor="date-to" className="text-xs">
            Hasta
          </Label>
          <Input
            id="date-to"
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) =>
              onChange({ ...filters, dateTo: e.target.value || undefined })
            }
            className="mt-1.5 h-10"
          />
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onDownloadPdf}
        loading={isDownloading}
        disabled={isDownloading}
      >
        <Download className="h-4 w-4" />
        Descargar PDF
      </Button>
    </div>
  );
}
