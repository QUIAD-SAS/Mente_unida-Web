import { useEffect, useState } from "react";
import { fetchAdminPlans, runBillingReminders, type BillingPlan, type ReminderRun } from "../../api/admin";
import { apiErrorMessage } from "../../api/client";
import { Panel } from "./bits";
import { money } from "./format";

export function AdminSettingsPage() {
  const [plans, setPlans] = useState<BillingPlan[] | null>(null);
  const [plansError, setPlansError] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ReminderRun | null>(null);
  const [runError, setRunError] = useState("");

  useEffect(() => {
    void fetchAdminPlans().then(
      (data) => setPlans(data.items),
      (error: unknown) => setPlansError(apiErrorMessage(error, "No se pudo leer el catálogo de planes.")),
    );
  }, []);

  async function run() {
    setRunning(true);
    setRunError("");
    try {
      setResult(await runBillingReminders());
    } catch (error) {
      setResult(null);
      setRunError(apiErrorMessage(error, "No se pudieron generar los recordatorios."));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-primary">Configuración de plataforma</h1>
        <p className="mt-2 max-w-3xl text-ink-soft">El API no guarda interruptores de recordatorios de citas, exigencia de RETHUS ni palabras de alerta. Publica el catálogo de planes y la generación de recordatorios de vencimiento de suscripciones. Esa generación no confirma un pago ni cambia el estado comercial.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Recordatorios de vencimiento</h2>
          <p className="text-sm leading-6 text-ink-soft">Usa las suscripciones reales. El aviso no se repite para el mismo período.</p>
          <button type="button" disabled={running} className="rounded-xl bg-primary-container px-4 py-3 font-display text-sm font-semibold text-white disabled:opacity-60" onClick={() => void run()}>
            {running ? "Generando…" : "Generar recordatorios"}
          </button>
          {runError ? <p className="text-sm text-secondary">{runError}</p> : null}
          {result ? (
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between rounded-xl bg-surface-low px-3 py-2"><span>Planeados</span><span className="font-semibold">{result.planned}</span></li>
              <li className="flex justify-between rounded-xl bg-surface-low px-3 py-2"><span>Enviados</span><span className="font-semibold">{result.sent}</span></li>
              <li className="flex justify-between rounded-xl bg-surface-low px-3 py-2"><span>Fallidos</span><span className="font-semibold">{result.failed}</span></li>
              <li className="flex justify-between rounded-xl bg-surface-low px-3 py-2"><span>Omitidos</span><span className="font-semibold">{result.skipped}</span></li>
              <li className="flex justify-between rounded-xl bg-surface-low px-3 py-2"><span>Cola</span><span className="font-semibold">{result.queue}</span></li>
            </ul>
          ) : null}
        </Panel>
        <Panel>
          <h2 className="font-display text-lg font-semibold">Planes</h2>
          {plansError ? <p className="mt-3 text-sm text-secondary">{plansError}</p> : null}
          {!plansError && plans && plans.length === 0 ? <p className="mt-3 text-sm text-ink-soft">No hay planes en el catálogo.</p> : null}
          <ul className="mt-3 space-y-2">
            {(plans ?? []).map((plan) => (
              <li key={plan.id} className="rounded-xl bg-surface-low px-3 py-3 text-sm">
                <span className="font-semibold">{plan.name}</span>
                <span className="mt-1 block text-xs text-ink-soft">{plan.code} · {money(plan.priceCents, plan.currency)} · {plan.billingInterval} · {plan.isActive ? "activo" : "inactivo"}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
