import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  approveVerification,
  fetchClinicalIntegrity,
  fetchCommunityReports,
  fetchDatabaseHealth,
  fetchNotifications,
  fetchProcessHealth,
  fetchRiskAlerts,
  fetchSupportReports,
  listVerifications,
  requestVerificationChanges,
  type AppNotification,
  type ClinicalIntegrity,
  type CommunityReport,
  type DatabaseHealth,
  type ProcessHealth,
  type RiskAlert,
  type SupportReport,
  type VerificationItem,
} from "../../api/admin";
import { apiErrorMessage } from "../../api/client";
import { Icon } from "../../components/Icon";
import { Avatar, Panel, Stat } from "./bits";
import { initials, notesIssue, verificationLabel, when } from "./format";

type Queue = {
  pending: VerificationItem[];
  reviewing: VerificationItem[];
  approved: VerificationItem[];
};

type Listening = {
  reports: SupportReport[] | null;
  alerts: RiskAlert[] | null;
  community: CommunityReport[] | null;
  reportsError: string;
  alertsError: string;
  communityError: string;
};

export function AdminDashboardPage() {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [queueError, setQueueError] = useState("");
  const [activity, setActivity] = useState<AppNotification[] | null>(null);
  const [activityError, setActivityError] = useState("");
  const [clinical, setClinical] = useState<ClinicalIntegrity | null>(null);
  const [clinicalError, setClinicalError] = useState("");
  const [process, setProcess] = useState<ProcessHealth | null>(null);
  const [database, setDatabase] = useState<DatabaseHealth | null>(null);
  const [serviceError, setServiceError] = useState("");
  const [listening, setListening] = useState<Listening | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [notesFor, setNotesFor] = useState("");
  const [notes, setNotes] = useState("");
  const [actionError, setActionError] = useState("");

  function load() {
    setLoading(true);
    setActionError("");

    void (async () => {
      const [pending, reviewing, approved, notices, integrity, health, db, reports, alerts, community] = await Promise.all([
        listVerifications("PENDING").then(
          (data) => ({ data, error: "" }),
          (error: unknown) => ({ data: null, error: apiErrorMessage(error, "No se pudieron leer las verificaciones.") }),
        ),
        listVerifications("IN_REVIEW").then(
          (data) => ({ data, error: "" }),
          (error: unknown) => ({ data: null, error: apiErrorMessage(error, "No se pudieron leer las verificaciones.") }),
        ),
        listVerifications("APPROVED").then(
          (data) => ({ data, error: "" }),
          (error: unknown) => ({ data: null, error: apiErrorMessage(error, "No se pudieron leer las verificaciones.") }),
        ),
        fetchNotifications("ALL").then(
          (data) => ({ data, error: "" }),
          (error: unknown) => ({ data: null, error: apiErrorMessage(error, "No se pudieron leer las notificaciones.") }),
        ),
        fetchClinicalIntegrity().then(
          (data) => ({ data, error: "" }),
          (error: unknown) => ({ data: null, error: apiErrorMessage(error, "No se pudo comprobar la auditoría clínica.") }),
        ),
        fetchProcessHealth().then(
          (data) => ({ data, error: "" }),
          (error: unknown) => ({ data: null, error: apiErrorMessage(error, "El proceso no respondió.") }),
        ),
        fetchDatabaseHealth().then(
          (data) => ({ data, error: "" }),
          (error: unknown) => ({ data: null, error: apiErrorMessage(error, "La base de datos no respondió.") }),
        ),
        fetchSupportReports().then(
          (data) => ({ data, error: "" }),
          (error: unknown) => ({ data: null, error: apiErrorMessage(error, "No se pudieron leer los reportes del Escuchadero.") }),
        ),
        fetchRiskAlerts().then(
          (data) => ({ data, error: "" }),
          (error: unknown) => ({ data: null, error: apiErrorMessage(error, "No se pudieron leer las alertas del Escuchadero.") }),
        ),
        fetchCommunityReports().then(
          (data) => ({ data, error: "" }),
          (error: unknown) => ({ data: null, error: apiErrorMessage(error, "No se pudieron leer los reportes de comunidad.") }),
        ),
      ]);

      const queueMessage = pending.error || reviewing.error || approved.error;
      setQueueError(queueMessage);
      setQueue(
        queueMessage
          ? null
          : {
              pending: pending.data?.items ?? [],
              reviewing: reviewing.data?.items ?? [],
              approved: approved.data?.items ?? [],
            },
      );
      setActivityError(notices.error);
      setActivity(notices.data?.items ?? null);
      setClinicalError(integrity.error);
      setClinical(integrity.data);
      setServiceError([health.error, db.error].filter(Boolean).join(" "));
      setProcess(health.data);
      setDatabase(db.data);
      setListening({
        reports: reports.data?.items ?? null,
        alerts: alerts.data?.items ?? null,
        community: community.data?.items ?? null,
        reportsError: reports.error,
        alertsError: alerts.error,
        communityError: community.error,
      });
      setBusyId("");
      setLoading(false);
    })();
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(item: VerificationItem) {
    setBusyId(item.id);
    setActionError("");
    try {
      await approveVerification(item.id);
      setNotesFor("");
      load();
    } catch (error) {
      setActionError(apiErrorMessage(error, "No se pudo aprobar la solicitud."));
      setBusyId("");
    }
  }

  async function askChanges(item: VerificationItem) {
    const issue = notesIssue(notes);
    if (issue) {
      setActionError(issue);
      return;
    }
    setBusyId(item.id);
    setActionError("");
    try {
      await requestVerificationChanges(item.id, notes.trim(), []);
      setNotes("");
      setNotesFor("");
      load();
    } catch (error) {
      setActionError(apiErrorMessage(error, "No se pudo pedir la corrección."));
      setBusyId("");
    }
  }

  const pending = queue?.pending ?? [];
  const capped = (items: VerificationItem[]) => (items.length >= 50 ? "al menos 50 en esta página" : "en el listado");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs font-semibold tracking-wide text-primary uppercase">Supervisión clínica</p>
          <h1 className="font-display text-3xl font-semibold text-primary">Panel de control</h1>
        </div>
        <Link to="/admin/validacion" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-display text-sm font-semibold text-white">
          <Icon name="verified_user" className="text-[18px]" />
          Revisar solicitudes
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Psicólogos verificados"
          value={queue ? String(queue.approved.length) : "—"}
          hint={queue ? capped(queue.approved) : "consultando"}
          icon="verified"
          hintClass="text-primary"
        />
        <Stat label="Pacientes atendidos" value="—" hint="el API no publica este total" icon="group" />
        <Stat label="Sesiones realizadas" value="—" hint="el API no publica este total" icon="calendar_month" />
        <Stat
          label="Validaciones pendientes"
          value={queue ? String(pending.length) : "—"}
          hint={queue ? capped(pending) : "consultando"}
          icon="pending_actions"
          hintClass="text-secondary"
        />
      </div>

      {queueError ? <p className="rounded-xl bg-secondary/10 px-4 py-3 text-sm text-secondary">{queueError}</p> : null}
      {actionError ? <p className="rounded-xl bg-secondary/10 px-4 py-3 text-sm text-secondary">{actionError}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Validaciones pendientes</h2>
            <span className="rounded-full bg-surface-mid px-3 py-1 text-xs font-semibold text-ink-soft">
              {loading ? "Cargando" : `${pending.length} en cola`}
            </span>
          </div>
          <div className="divide-y divide-surface-high">
            {!loading && pending.length === 0 && !queueError ? <p className="py-6 text-sm text-ink-soft">No hay solicitudes pendientes.</p> : null}
            {pending.map((item) => (
              <article key={item.id} className="flex flex-col gap-3 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar initials={initials(item.name)} />
                    <div className="min-w-0">
                      <p className="font-display font-semibold">{item.name}</p>
                      <p className="truncate text-sm text-ink-soft">
                        {item.city || "Sin ciudad"} · {item.documentCount} documento{item.documentCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <span className="w-fit rounded-lg bg-surface-low px-2 py-1 text-xs font-semibold text-primary">{item.licenseNumber}</span>
                  <div className="flex gap-2">
                    <button type="button" disabled={busyId === item.id} className="rounded-lg bg-primary-container px-3 py-2 font-display text-sm font-semibold text-white disabled:opacity-60" onClick={() => void approve(item)}>
                      Aprobar
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-surface-mid px-3 py-2 text-sm font-semibold"
                      aria-expanded={notesFor === item.id}
                      aria-label={`Pedir corrección a ${item.name}`}
                      onClick={() => {
                        setNotesFor((current) => (current === item.id ? "" : item.id));
                        setNotes("");
                        setActionError("");
                      }}
                    >
                      <Icon name="edit_document" className="text-[18px]" />
                    </button>
                  </div>
                </div>
                {notesFor === item.id ? (
                  <form
                    className="space-y-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void askChanges(item);
                    }}
                  >
                    <label className="block text-sm font-semibold" htmlFor={`notes-${item.id}`}>
                      Nota para el profesional
                      <textarea id={`notes-${item.id}`} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 min-h-20 w-full rounded-xl bg-surface-low px-3 py-2 font-normal outline-none" />
                    </label>
                    <button type="submit" disabled={busyId === item.id} className="rounded-lg bg-surface-mid px-3 py-2 text-sm font-semibold disabled:opacity-60">
                      Pedir corrección
                    </button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
          {queue && queue.reviewing.length > 0 ? (
            <p className="mt-2 text-sm text-ink-soft">{queue.reviewing.length} solicitud{queue.reviewing.length === 1 ? "" : "es"} en {verificationLabel.IN_REVIEW.toLowerCase()}.</p>
          ) : null}
          <Link to="/admin/validacion" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Ver todas las solicitudes
            <Icon name="arrow_forward" className="text-[16px]" />
          </Link>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <h2 className="font-display text-lg font-semibold">Actividad reciente</h2>
            {activityError ? <p className="mt-3 text-sm text-secondary">{activityError}</p> : null}
            {!activityError && activity && activity.length === 0 ? <p className="mt-3 text-sm text-ink-soft">No hay notificaciones en esta cuenta.</p> : null}
            <ul className="mt-3 space-y-3 text-sm">
              {(activity ?? []).slice(0, 6).map((item) => (
                <li key={item.id}>
                  {item.title}
                  <span className="block text-xs text-ink-soft">{when(item.createdAt)}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <h2 className="font-display text-lg font-semibold">Cumplimiento y seguridad</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between gap-3 rounded-xl bg-surface-low px-3 py-2">
                <span>Cadena clínica</span>
                <span className="text-right font-semibold text-primary">
                  {clinicalError ? "Sin lectura" : clinical ? (clinical.intact ? "Íntegra" : "Con ruptura") : "…"}
                </span>
              </li>
              <li className="flex justify-between gap-3 rounded-xl bg-surface-low px-3 py-2">
                <span>Eventos revisados</span>
                <span className="font-semibold text-primary">{clinical ? String(clinical.checked) : "—"}</span>
              </li>
              <li className="flex justify-between gap-3 rounded-xl bg-surface-low px-3 py-2">
                <span>Proceso</span>
                <span className="font-semibold text-primary">{process ? `${process.status} · ${process.version}` : "—"}</span>
              </li>
              <li className="flex justify-between gap-3 rounded-xl bg-surface-low px-3 py-2">
                <span>Base de datos</span>
                <span className="font-semibold text-primary">{database ? `${database.status} · ${database.latencyMs} ms` : "—"}</span>
              </li>
            </ul>
            {clinicalError ? <p className="mt-3 text-sm text-secondary">{clinicalError}</p> : null}
            {serviceError ? <p className="mt-2 text-sm text-secondary">{serviceError}</p> : null}
            {clinical && clinical.legacy > 0 ? <p className="mt-2 text-xs text-ink-soft">{clinical.legacy} evento{clinical.legacy === 1 ? "" : "s"} fuera de la cadena con hash.</p> : null}
          </Panel>
        </div>
      </div>

      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Icon name="chat" className="text-[22px] text-primary" />
            El Escuchadero y la comunidad
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Count label="Reportes del Escuchadero" value={listening?.reports} error={listening?.reportsError ?? ""} />
          <Count label="Alertas abiertas" value={listening?.alerts} error={listening?.alertsError ?? ""} />
          <Count label="Reportes de comunidad" value={listening?.community} error={listening?.communityError ?? ""} />
        </div>
        <p className="mt-3 text-xs text-ink-soft">Cada listado trae hasta 20 casos abiertos. El rol de administrador no abre estos reportes: hace falta el permiso de moderación.</p>
      </Panel>
    </div>
  );
}

function Count({ label, value, error }: { label: string; value: { length: number } | null | undefined; error: string }) {
  return (
    <div className="rounded-xl bg-surface-low p-4">
      <p className="text-sm text-ink-soft">{label}</p>
      {error ? <p className="mt-2 text-sm leading-6 text-secondary">{error}</p> : <p className="mt-1 font-display text-2xl font-semibold">{value ? String(value.length) : "—"}</p>}
    </div>
  );
}
