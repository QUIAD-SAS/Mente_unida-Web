import { useEffect, useState } from "react";
import { fetchCommunityReports, fetchRiskAlerts, fetchSupportReports, type CommunityReport, type RiskAlert, type SupportReport } from "../../api/admin";
import { apiErrorMessage } from "../../api/client";
import { Panel, Stat } from "./bits";
import { when } from "./format";

export function AdminCommunityPage() {
  const [reports, setReports] = useState<SupportReport[] | null>(null);
  const [alerts, setAlerts] = useState<RiskAlert[] | null>(null);
  const [community, setCommunity] = useState<CommunityReport[] | null>(null);
  const [reportsError, setReportsError] = useState("");
  const [alertsError, setAlertsError] = useState("");
  const [communityError, setCommunityError] = useState("");

  useEffect(() => {
    void fetchSupportReports().then(
      (data) => setReports(data.items),
      (error: unknown) => setReportsError(apiErrorMessage(error, "No se pudieron leer los reportes del Escuchadero.")),
    );
    void fetchRiskAlerts().then(
      (data) => setAlerts(data.items),
      (error: unknown) => setAlertsError(apiErrorMessage(error, "No se pudieron leer las alertas.")),
    );
    void fetchCommunityReports().then(
      (data) => setCommunity(data.items),
      (error: unknown) => setCommunityError(apiErrorMessage(error, "No se pudieron leer los reportes de la comunidad.")),
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ink-soft">Reportes abiertos, sin el texto de los mensajes</p>
        <h1 className="font-display text-3xl font-semibold text-primary">Moderación de comunidad y foros</h1>
        <p className="mt-2 max-w-3xl text-ink-soft">Estas rutas exigen un permiso de moderación concedido aparte. El rol de administrador no lo reemplaza. Cada listado trae hasta 20 casos abiertos y no incluye el contenido.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Reportes del Escuchadero" value={reports ? String(reports.length) : "—"} hint={reportsError ? "sin permiso" : "pendientes o en revisión"} icon="chat" hintClass="text-secondary" />
        <Stat label="Alertas abiertas" value={alerts ? String(alerts.length) : "—"} hint={alertsError ? "sin permiso" : "sin el relato"} icon="crisis_alert" hintClass="text-secondary" />
        <Stat label="Reportes de comunidad" value={community ? String(community.length) : "—"} hint={communityError ? "sin permiso" : "pendientes o en revisión"} icon="forum" />
      </div>

      <Queue title="Escuchadero" error={reportsError} empty="No hay reportes abiertos del Escuchadero." rows={(reports ?? []).map((item) => ({ id: item.id, title: item.category, meta: `${item.status} · ${when(item.createdAt)}` }))} />
      <Queue title="Alertas de riesgo" error={alertsError} empty="No hay alertas abiertas." rows={(alerts ?? []).map((item) => ({ id: item.id, title: item.status, meta: when(item.createdAt) }))} />
      <Queue title="Comunidad" error={communityError} empty="No hay reportes abiertos de la comunidad." rows={(community ?? []).map((item) => ({ id: item.id, title: item.category, meta: `${item.status} · ${when(item.createdAt)}` }))} />
    </div>
  );
}

function Queue({ title, error, empty, rows }: { title: string; error: string; empty: string; rows: { id: string; title: string; meta: string }[] }) {
  return (
    <Panel>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {error ? <p className="mt-3 text-sm leading-6 text-secondary">{error}</p> : null}
      {!error && rows.length === 0 ? <p className="mt-3 text-sm text-ink-soft">{empty}</p> : null}
      <ul className="mt-3 space-y-2">
        {rows.map((item) => (
          <li key={item.id} className="rounded-xl bg-surface-low px-3 py-3 text-sm">
            <span className="font-semibold">{item.title}</span>
            <span className="block text-xs text-ink-soft">{item.meta}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
