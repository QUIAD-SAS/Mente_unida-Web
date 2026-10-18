"use client";

import { PacientesView } from "@/components/pacientes/pacientes-view";
import { PsicologosView } from "@/components/psicologos/psicologos-view";
import { cn } from "@/lib/utils";
import { Sparkles, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type UsuariosTab = "pacientes" | "psicologos";

const TABS: Array<{
  id: UsuariosTab;
  label: string;
  icon: typeof UserRound;
}> = [
  { id: "pacientes", label: "Pacientes", icon: UserRound },
  { id: "psicologos", label: "Psicólogos", icon: Sparkles },
];

export function UsuariosView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: UsuariosTab =
    tabParam === "psicologos" ? "psicologos" : "pacientes";

  const setTab = useCallback(
    (tab: UsuariosTab) => {
      router.replace(`/dashboard/usuarios?tab=${tab}`, { scroll: false });
    },
    [router],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-mu-text">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-mu-text-muted">
          Gestión de pacientes y psicólogos de la plataforma.
        </p>
      </div>

      <div
        className="inline-flex rounded-xl border border-mu-border bg-mu-surface p-1"
        role="tablist"
        aria-label="Tipo de usuario"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-mu-primary text-white shadow-sm"
                  : "text-mu-text-muted hover:bg-mu-accent hover:text-mu-text",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {activeTab === "pacientes" ? (
          <PacientesView embedded />
        ) : (
          <PsicologosView embedded />
        )}
      </div>
    </div>
  );
}
