"use client";

import {
  ConfiguracionCommissionsForm,
  ConfiguracionPlansForm,
} from "@/components/configuracion/configuracion-forms";
import { ConfiguracionSectionPlaceholder } from "@/components/configuracion/configuracion-section-placeholder";
import { ConfiguracionSidebar } from "@/components/configuracion/configuracion-sidebar";
import { useConfig } from "@/lib/admin/configuracion/queries";
import type { ConfigSection } from "@/lib/admin/configuracion/types";
import { useState } from "react";

export function ConfiguracionView() {
  const [section, setSection] = useState<ConfigSection>("plans");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useConfig();

  function handleSaved(message: string) {
    setError(null);
    setFeedback(message);
  }

  function handleError(message: string) {
    setFeedback(null);
    setError(message);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-mu-text">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-mu-text-muted">
          Administración de parámetros del sistema.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <ConfiguracionSidebar active={section} onChange={setSection} />

        <div className="min-w-0 space-y-6">
          {feedback ? (
            <p
              className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700"
              role="status"
            >
              {feedback}
            </p>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-mu-error/30 bg-mu-error/5 px-4 py-3 text-sm text-mu-error">
              {error}
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-xl border border-mu-error/30 bg-mu-error/5 px-4 py-3 text-sm text-mu-error">
              No se pudo cargar la configuración.
            </div>
          ) : null}

          {section === "plans" ? (
            <ConfiguracionPlansForm
              plans={data?.plans}
              isLoading={isLoading}
              onSaved={handleSaved}
              onError={handleError}
            />
          ) : section === "commissions" ? (
            <ConfiguracionCommissionsForm
              commissions={data?.commissions}
              isLoading={isLoading}
              onSaved={handleSaved}
              onError={handleError}
            />
          ) : (
            <ConfiguracionSectionPlaceholder section={section} />
          )}
        </div>
      </div>
    </div>
  );
}
