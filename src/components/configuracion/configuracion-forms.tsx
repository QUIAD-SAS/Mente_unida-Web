"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Textarea } from "@/components/admin/ui/textarea";
import {
  CRITICAL_CONFIG_NOTICE,
  PLAN_TYPE_LABELS,
  ShieldIcon,
} from "@/lib/admin/configuracion/labels";
import { useConfigUpdate } from "@/lib/admin/configuracion/queries";
import type { CommissionConfig, PlanConfig } from "@/lib/admin/configuracion/types";
import { useEffect, useState } from "react";

interface ConfiguracionPlansFormProps {
  plans?: PlanConfig[];
  isLoading?: boolean;
  onSaved?: (message: string) => void;
  onError?: (message: string) => void;
}

export function ConfiguracionPlansForm({
  plans,
  isLoading,
  onSaved,
  onError,
}: ConfiguracionPlansFormProps) {
  const updateMutation = useConfigUpdate();
  const [drafts, setDrafts] = useState<Record<string, { price: string; benefits: string }>>({});

  useEffect(() => {
    if (!plans) return;
    const next: Record<string, { price: string; benefits: string }> = {};
    for (const plan of plans) {
      next[plan.id] = {
        price: String(plan.price),
        benefits: plan.benefits.join("\n"),
      };
    }
    setDrafts(next);
  }, [plans]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  const items = plans ?? [];

  async function savePlan(plan: PlanConfig) {
    const draft = drafts[plan.id];
    if (!draft) return;

    const price = Number(draft.price);
    if (Number.isNaN(price) || price < 0) {
      onError?.("El precio debe ser un número válido.");
      return;
    }

    const benefits = draft.benefits
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);

    try {
      await updateMutation.mutateAsync({
        section: "plans",
        planId: plan.id,
        price,
        benefits,
      });
      onSaved?.(`Plan ${PLAN_TYPE_LABELS[plan.id]} actualizado.`);
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el plan",
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
        <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p className="text-sm text-amber-800">{CRITICAL_CONFIG_NOTICE}</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-mu-text-muted">
            No hay planes configurados.
          </CardContent>
        </Card>
      ) : (
        items.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">
                {PLAN_TYPE_LABELS[plan.id]}
              </CardTitle>
              {plan.critical ? (
                <Badge variant="warning" className="text-[10px]">
                  Crítico
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor={`price-${plan.id}`}
                  className="text-xs font-medium text-mu-text-muted"
                >
                  Precio ({plan.currency})
                </label>
                <Input
                  id={`price-${plan.id}`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={drafts[plan.id]?.price ?? ""}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [plan.id]: {
                        ...drafts[plan.id],
                        price: e.target.value,
                        benefits: drafts[plan.id]?.benefits ?? "",
                      },
                    })
                  }
                  className="mt-1 h-10"
                />
              </div>

              <div>
                <label
                  htmlFor={`benefits-${plan.id}`}
                  className="text-xs font-medium text-mu-text-muted"
                >
                  Beneficios (uno por línea)
                </label>
                <Textarea
                  id={`benefits-${plan.id}`}
                  rows={4}
                  value={drafts[plan.id]?.benefits ?? ""}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [plan.id]: {
                        price: drafts[plan.id]?.price ?? "",
                        benefits: e.target.value,
                      },
                    })
                  }
                  className="mt-1"
                  placeholder="Acceso a comunidad&#10;Sesiones ilimitadas"
                />
              </div>

              <Button
                type="button"
                size="sm"
                loading={updateMutation.isPending}
                disabled={updateMutation.isPending}
                onClick={() => void savePlan(plan)}
              >
                Guardar cambios
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

interface ConfiguracionCommissionsFormProps {
  commissions?: CommissionConfig;
  isLoading?: boolean;
  onSaved?: (message: string) => void;
  onError?: (message: string) => void;
}

export function ConfiguracionCommissionsForm({
  commissions,
  isLoading,
  onSaved,
  onError,
}: ConfiguracionCommissionsFormProps) {
  const updateMutation = useConfigUpdate();
  const [platformRate, setPlatformRate] = useState("");
  const [supervisorRate, setSupervisorRate] = useState("");

  useEffect(() => {
    if (!commissions) return;
    setPlatformRate(String(commissions.platformRate));
    setSupervisorRate(String(commissions.supervisorRate));
  }, [commissions]);

  if (isLoading) {
    return <Skeleton className="h-48 rounded-xl" />;
  }

  async function handleSave() {
    const platform = Number(platformRate);
    const supervisor = Number(supervisorRate);

    if (
      Number.isNaN(platform) ||
      Number.isNaN(supervisor) ||
      platform < 0 ||
      supervisor < 0
    ) {
      onError?.("Las tasas deben ser números válidos.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        section: "commissions",
        platformRate: platform,
        supervisorRate: supervisor,
      });
      onSaved?.("Comisiones actualizadas.");
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error.message
          : "No se pudieron guardar las comisiones",
      );
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Comisiones</CardTitle>
        {commissions?.critical ? (
          <Badge variant="warning" className="text-[10px]">
            Crítico
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="platform-rate"
              className="text-xs font-medium text-mu-text-muted"
            >
              Comisión plataforma (%)
            </label>
            <Input
              id="platform-rate"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={platformRate}
              onChange={(e) => setPlatformRate(e.target.value)}
              className="mt-1 h-10"
            />
          </div>
          <div>
            <label
              htmlFor="supervisor-rate"
              className="text-xs font-medium text-mu-text-muted"
            >
              Comisión supervisor (%)
            </label>
            <Input
              id="supervisor-rate"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={supervisorRate}
              onChange={(e) => setSupervisorRate(e.target.value)}
              className="mt-1 h-10"
            />
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          loading={updateMutation.isPending}
          disabled={updateMutation.isPending}
          onClick={() => void handleSave()}
        >
          Guardar comisiones
        </Button>
      </CardContent>
    </Card>
  );
}
