"use client";

import { Button } from "@/components/admin/ui/button";
import { Eye, Key, Pencil } from "lucide-react";

interface TableRowActionsProps {
  onView: () => void;
  onEdit: () => void;
  onChangePassword: () => void;
}

export function TableRowActions({
  onView,
  onEdit,
  onChangePassword,
}: TableRowActionsProps) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onView}
        aria-label="Ver"
        title="Ver"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onEdit}
        aria-label="Editar"
        title="Editar"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onChangePassword}
        aria-label="Cambiar contraseña"
        title="Cambiar contraseña"
      >
        <Key className="h-4 w-4" />
      </Button>
    </div>
  );
}
