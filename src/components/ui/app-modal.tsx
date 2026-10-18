"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";

export interface AppModalAction {
  label: string;
  /** Recibe el motivo cuando el modal tiene campo `reason`; si no, string vacío. */
  onClick: (reason: string) => void;
  variant?: "primary" | "outline" | "ghost" | "destructive";
  loading?: boolean;
  disabled?: boolean;
}

export interface AppModalReasonConfig {
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  rows?: number;
}

interface AppModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children?: ReactNode;
  /** Campo de motivo. Si `required` y vacío / Cancelar → no ejecuta la acción. */
  reason?: AppModalReasonConfig;
  primaryAction?: AppModalAction;
  secondaryAction?: Omit<AppModalAction, "onClick"> & {
    onClick?: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
} as const;

/**
 * Modal de producto parametrizado (reemplaza alert / confirm / prompt).
 * Cerrar, Cancelar u overlay nunca confirma la acción.
 */
export function AppModal({
  open,
  title,
  description,
  onClose,
  children,
  reason,
  primaryAction,
  secondaryAction,
  className,
  size = "md",
}: AppModalProps) {
  const titleId = useId();
  const reasonId = useId();
  const [reasonValue, setReasonValue] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReasonValue("");
      setReasonError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handlePrimary() {
    if (!primaryAction) return;
    const trimmed = reasonValue.trim();
    if (reason?.required) {
      const min = reason.minLength ?? 3;
      if (trimmed.length < min) {
        setReasonError(
          `Indica un motivo de al menos ${min} caracteres para continuar.`,
        );
        return;
      }
    }
    setReasonError(null);
    primaryAction.onClick(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative w-full rounded-b-none p-5 shadow-xl sm:rounded-b-mu",
          sizeClass[size],
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-mu p-1 text-mu-text-muted hover:bg-mu-accent hover:text-mu-text"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id={titleId}
          className="pr-8 font-heading text-lg font-semibold text-mu-text"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-mu-text-muted">{description}</p>
        ) : null}

        {children ? <div className="mt-4">{children}</div> : null}

        {reason ? (
          <div className="mt-4">
            <label
              htmlFor={reasonId}
              className="mb-1.5 block text-sm font-medium text-mu-text"
            >
              {reason.label}
              {reason.required ? (
                <span className="text-mu-error" aria-hidden>
                  {" "}
                  *
                </span>
              ) : null}
            </label>
            <textarea
              id={reasonId}
              rows={reason.rows ?? 3}
              value={reasonValue}
              placeholder={reason.placeholder}
              onChange={(e) => {
                setReasonValue(e.target.value);
                if (reasonError) setReasonError(null);
              }}
              className="w-full rounded-mu border border-mu-border px-3 py-2 text-sm text-mu-text focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary"
              aria-invalid={reasonError ? true : undefined}
            />
            {reasonError ? (
              <p className="mt-1.5 text-xs text-mu-error" role="alert">
                {reasonError}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant={secondaryAction?.variant ?? "ghost"}
            className="flex-1"
            onClick={() => {
              secondaryAction?.onClick?.();
              onClose();
            }}
            disabled={primaryAction?.loading}
          >
            {secondaryAction?.label ?? "Cancelar"}
          </Button>
          {primaryAction ? (
            <Button
              type="button"
              variant={primaryAction.variant ?? "primary"}
              className="flex-1"
              loading={primaryAction.loading}
              disabled={primaryAction.disabled}
              onClick={handlePrimary}
            >
              {primaryAction.label}
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
