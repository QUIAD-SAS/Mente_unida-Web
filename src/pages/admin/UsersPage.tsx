import { useEffect, useState } from "react";
import { fetchAdminSubscriptions, type AdminSubscription } from "../../api/admin";
import { apiErrorMessage } from "../../api/client";
import { Panel, Stat } from "./bits";
import { money, when } from "./format";

export function AdminUsersPage() {
  const [items, setItems] = useState<AdminSubscription[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchAdminSubscriptions().then(
      (data) => {
        setItems(data.items);
        setCursor(data.nextCursor);
      },
      (reason: unknown) => setError(apiErrorMessage(reason, "No se pudieron leer las suscripciones.")),
    );
  }, []);

  const confirmed = items?.filter((item) => item.paymentConfirmed).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-primary">Gestión de usuarios y pacientes</h1>
        <p className="mt-2 max-w-3xl text-ink-soft">El API no publica el directorio de pacientes ni de cuentas. Cada persona solo consulta sus propios recursos. Lo que sí lista el administrador son las suscripciones, sin datos de tarjeta ni de pago.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Suscripciones en esta página" value={items ? String(items.length) : "—"} hint="hasta 20" icon="group" />
        <Stat label="Con pago confirmado" value={items ? String(confirmed) : "—"} hint="esta etapa no cobra" icon="payments" />
        <Stat label="Página siguiente" value={cursor ? "Sí" : items ? "No" : "—"} hint="cursor del listado" icon="arrow_forward" />
      </div>
      {error ? <p className="rounded-xl bg-secondary/10 px-4 py-3 text-sm text-secondary">{error}</p> : null}
      <Panel>
        <h2 className="font-display text-lg font-semibold">Suscripciones</h2>
        {!error && items && items.length === 0 ? <p className="mt-3 text-sm text-ink-soft">No hay suscripciones registradas.</p> : null}
        <div className="mt-4 space-y-2">
          {(items ?? []).map((item) => (
            <article key={item.id} className="grid gap-2 rounded-xl bg-surface-low p-3 text-sm sm:grid-cols-[1.2fr_1fr_auto]">
              <div>
                <p className="font-display font-semibold">{item.plan?.name ?? "Sin plan"}</p>
                <p className="text-xs text-ink-soft">{item.plan?.code ?? item.id}</p>
              </div>
              <p className="text-ink-soft">Cuenta {item.userId}</p>
              <div className="text-right">
                <p className="font-semibold text-primary">{item.status}</p>
                <p className="text-xs text-ink-soft">{money(item.priceCents, item.currency)} · pago {item.paymentConfirmed ? "confirmado" : "sin confirmar"}</p>
                <p className="text-xs text-ink-soft">{when(item.createdAt)}</p>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
