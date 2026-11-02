import { useEffect, useState } from "react";
import { fetchClinicalIntegrity, fetchDatabaseHealth, fetchProcessHealth, fetchRedisHealth, type ClinicalIntegrity, type DatabaseHealth, type ProcessHealth, type RedisHealth } from "../../api/admin";
import { apiErrorMessage } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Panel, Stat } from "./bits";

export function AdminMetricsPage() {
  const { user } = useAuth();
  const [clinical, setClinical] = useState<ClinicalIntegrity | null>(null);
  const [clinicalError, setClinicalError] = useState("");
  const [process, setProcess] = useState<ProcessHealth | null>(null);
  const [database, setDatabase] = useState<DatabaseHealth | null>(null);
  const [redis, setRedis] = useState<RedisHealth | null>(null);
  const [serviceError, setServiceError] = useState("");
  const [checking, setChecking] = useState(false);

  function checkIntegrity() {
    setChecking(true);
    setClinicalError("");
    void fetchClinicalIntegrity()
      .then(setClinical)
      .catch((error: unknown) => setClinicalError(apiErrorMessage(error, "No se pudo comprobar la cadena clínica.")))
      .finally(() => setChecking(false));
  }

  useEffect(() => {
    checkIntegrity();
    void Promise.all([
      fetchProcessHealth().then(
        (data) => ({ data, error: "" }),
        (error: unknown) => ({ data: null, error: apiErrorMessage(error, "El proceso no respondió.") }),
      ),
      fetchDatabaseHealth().then(
        (data) => ({ data, error: "" }),
        (error: unknown) => ({ data: null, error: apiErrorMessage(error, "La base de datos no respondió.") }),
      ),
      fetchRedisHealth().then(
        (data) => ({ data, error: "" }),
        (error: unknown) => ({ data: null, error: apiErrorMessage(error, "Redis no respondió.") }),
      ),
    ]).then(([health, db, cache]) => {
      setProcess(health.data);
      setDatabase(db.data);
      setRedis(cache.data);
      setServiceError([health.error, db.error, cache.error].filter(Boolean).join(" "));
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Integridad de la auditoría</p>
        <h1 className="font-display text-3xl font-semibold text-primary">Métricas y auditoría clínica</h1>
        <p className="mt-2 max-w-3xl text-ink-soft">El API informa si la cadena de hashes está íntegra y cuántos eventos revisó. No entrega nombres de pacientes, profesionales ni el contenido de las historias. Cada consulta queda registrada.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Cadena clínica" value={clinical ? (clinical.intact ? "Íntegra" : "Rota") : "—"} hint={clinicalError || "resultado de la comprobación"} icon="fact_check" hintClass={clinical?.intact ? "text-primary" : "text-secondary"} />
        <Stat label="Eventos revisados" value={clinical ? String(clinical.checked) : "—"} hint="con hash" icon="monitoring" />
        <Stat label="Eventos heredados" value={clinical ? String(clinical.legacy) : "—"} hint="fuera de la cadena" icon="history" />
        <Stat label="Proceso" value={process?.status ?? "—"} hint={process ? `${process.service} ${process.version}` : "consultando"} icon="dns" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <Panel>
          <h2 className="font-display text-lg font-semibold">Resultado de la cadena</h2>
          {clinicalError ? <p className="mt-3 text-sm text-secondary">{clinicalError}</p> : null}
          {clinical ? (
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              {clinical.intact
                ? `La cadena revisó ${clinical.checked} evento${clinical.checked === 1 ? "" : "s"} y se mantiene íntegra.`
                : `La comprobación encontró una ruptura después de revisar ${clinical.checked} evento${clinical.checked === 1 ? "" : "s"}.`}
              {clinical.legacy > 0 ? ` ${clinical.legacy} evento${clinical.legacy === 1 ? "" : "s"} quedaron fuera del cálculo con hash.` : ""}
            </p>
          ) : null}
          <p className="mt-4 text-sm text-ink-soft">No hay un listado de historias ni porcentajes de consentimiento en esta ruta.</p>
        </Panel>
        <Panel className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Servicios</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between gap-3 rounded-xl bg-surface-low px-3 py-2"><span>Entorno</span><span className="font-semibold">{process?.environment ?? "—"}</span></li>
            <li className="flex justify-between gap-3 rounded-xl bg-surface-low px-3 py-2"><span>PostgreSQL</span><span className="font-semibold">{database ? `${database.status} · ${database.latencyMs} ms` : "—"}</span></li>
            <li className="flex justify-between gap-3 rounded-xl bg-surface-low px-3 py-2"><span>Redis</span><span className="font-semibold">{redis ? `${redis.status}${redis.latencyMs !== undefined ? ` · ${redis.latencyMs} ms` : ""}` : "—"}</span></li>
          </ul>
          {serviceError ? <p className="text-sm text-secondary">{serviceError}</p> : null}
          <div className="rounded-xl bg-surface-low p-4">
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Sesión que consulta</p>
            <p className="mt-1 font-display font-semibold">{user?.name || "Administración"}</p>
            <p className="text-sm text-ink-soft">{user?.email}</p>
          </div>
          <button type="button" disabled={checking} className="w-full rounded-xl bg-primary-container px-4 py-3 font-display text-sm font-semibold text-white disabled:opacity-60" onClick={checkIntegrity}>
            {checking ? "Comprobando…" : "Volver a comprobar la cadena"}
          </button>
        </Panel>
      </div>
    </div>
  );
}
