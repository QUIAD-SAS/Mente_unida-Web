"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { AlertCircle, X } from "lucide-react";

interface UnavailableDialogProps {
  open: boolean;
  label: string;
  onClose: () => void;
}

export function UnavailableDialog({
  open,
  label,
  onClose,
}: UnavailableDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unavailable-title"
    >
      <Card className="relative w-full max-w-sm p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-mu p-1 text-mu-text-muted hover:bg-mu-accent hover:text-mu-text"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-start gap-3">
          <AlertCircle
            className="h-6 w-6 shrink-0 text-mu-warning"
            aria-hidden
          />
          <div>
            <CardTitle id="unavailable-title" className="text-lg">
              Página no disponible
            </CardTitle>
            <CardDescription className="mt-2 text-base text-mu-text">
              <strong>{label}</strong> estará disponible próximamente. Seguimos
              trabajando en esta sección.
            </CardDescription>
          </div>
        </div>
        <Button className="mt-6 w-full" onClick={onClose}>
          Entendido
        </Button>
      </Card>
    </div>
  );
}
