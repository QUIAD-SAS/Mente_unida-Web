import { useEffect, useMemo, useState } from "react";
import {
  approveVerification,
  fetchVerification,
  listVerifications,
  rejectVerification,
  requestVerificationChanges,
  type VerificationDetail,
  type VerificationItem,
  type VerificationStatus,
} from "../../api/admin";
import { apiErrorMessage } from "../../api/client";
import { Icon } from "../../components/Icon";
import { Avatar, Panel, Stat } from "./bits";
import { decisionLabel, documentTypeLabel, initials, notesIssue, verificationLabel, when } from "./format";

const filters: { id: VerificationStatus; label: string }[] = [
  { id: "PENDING", label: "Pendientes" },
  { id: "IN_REVIEW", label: "En revisión" },
  { id: "APPROVED", label: "Aprobados" },
  { id: "REJECTED", label: "Rechazados" },
];

export function AdminValidationPage() {
  const [lists, setLists] = useState<Partial<Record<VerificationStatus, VerificationItem[]>>>({});
  const [listError, setListError] = useState("");
  const [filter, setFilter] = useState<VerificationStatus>("PENDING");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<VerificationDetail | null>(null);
  const [detailError, setDetailError] = useState("");
  const [notes, setNotes] = useState("");
  const [documentIds, setDocumentIds] = useState<string[]>([]);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  function loadLists(preferId = "") {
    setLoading(true);
    void Promise.all(filters.map((item) => listVerifications(item.id)))
      .then((pages) => {
        const next: Partial<Record<VerificationStatus, VerificationItem[]>> = {};
        filters.forEach((item, index) => {
          next[item.id] = pages[index]?.items ?? [];
        });
        setLists(next);
        setListError("");
        const current = next[filter] ?? [];
        const keep = current.find((item) => item.id === (preferId || selectedId));
        setSelectedId(keep?.id ?? current[0]?.id ?? "");
      })
      .catch((error: unknown) => setListError(apiErrorMessage(error, "No se pudieron leer las solicitudes.")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadLists();
    // La carga inicial no depende del filtro elegido después.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const current = lists[filter] ?? [];
    if (!current.some((item) => item.id === selectedId)) setSelectedId(current[0]?.id ?? "");
  }, [filter, lists, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let alive = true;
    setDetailError("");
    void fetchVerification(selectedId)
      .then((data) => {
        if (alive) setDetail(data);
      })
      .catch((error: unknown) => {
        if (alive) {
          setDetail(null);
          setDetailError(apiErrorMessage(error, "No se pudo leer el expediente."));
        }
      });
    return () => {
      alive = false;
    };
  }, [selectedId]);

  const visible = useMemo(() => {
    const items = lists[filter] ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => `${item.name} ${item.email} ${item.licenseNumber} ${item.city ?? ""}`.toLowerCase().includes(needle));
  }, [filter, lists, query]);

  const selected = visible.find((item) => item.id === selectedId) ?? visible[0];

  async function run(action: "approve" | "reject" | "changes") {
    if (!selected) return;
    if (action !== "approve") {
      const issue = notesIssue(notes);
      if (issue) {
        setActionError(issue);
        return;
      }
    }
    setBusy(true);
    setActionError("");
    try {
      const saved =
        action === "approve"
          ? await approveVerification(selected.id)
          : action === "reject"
            ? await rejectVerification(selected.id, notes.trim())
            : await requestVerificationChanges(selected.id, notes.trim(), documentIds);
      setDetail(saved);
      setNotes("");
      setDocumentIds([]);
      loadLists(saved.id);
      setFilter(saved.verificationStatus);
    } catch (error) {
      setActionError(apiErrorMessage(error, "No se pudo registrar la decisión."));
    } finally {
      setBusy(false);
    }
  }

  function toggleDocument(id: string) {
    setDocumentIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ink-soft">Solicitudes de verificación profesional</p>
        <h1 className="font-display text-3xl font-semibold text-primary">Validación de psicólogos</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Pendientes" value={count(lists.PENDING, loading)} hint="hasta 50" icon="pending_actions" hintClass="text-secondary" />
        <Stat label="Aprobados" value={count(lists.APPROVED, loading)} hint="hasta 50" icon="verified" hintClass="text-primary" />
        <Stat label="En revisión" value={count(lists.IN_REVIEW, loading)} hint="con corrección pedida" icon="edit_document" />
        <Stat label="Rechazados" value={count(lists.REJECTED, loading)} hint="hasta 50" icon="gpp_bad" />
      </div>
      {listError ? <p className="rounded-xl bg-secondary/10 px-4 py-3 text-sm text-secondary">{listError}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <Panel>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Expedientes</h2>
            <span className="text-sm text-ink-soft">{visible.length} en esta página</span>
          </div>
          <div className="mb-3 flex gap-1 overflow-x-auto rounded-xl bg-surface-low p-1">
            {filters.map((item) => (
              <button key={item.id} type="button" className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${filter === item.id ? "bg-white text-primary shadow-sm" : "text-ink-soft"}`} onClick={() => setFilter(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          <label className="mb-3 flex items-center gap-2 rounded-xl bg-surface-low px-3 py-2">
            <Icon name="search" className="text-[20px] text-ink-soft" />
            <span className="sr-only">Buscar expediente</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, correo o tarjeta" className="min-w-0 flex-1 bg-transparent text-base outline-none" />
          </label>
          <div className="space-y-2">
            {visible.length === 0 ? <p className="py-6 text-sm text-ink-soft">No hay solicitudes con ese filtro.</p> : null}
            {visible.map((item) => (
              <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`flex w-full items-start gap-3 rounded-xl p-3 text-left ${selected?.id === item.id ? "bg-surface-low ring-1 ring-primary/20" : "hover:bg-surface-low"}`}>
                <Avatar initials={initials(item.name)} />
                <span className="min-w-0">
                  <span className="block font-display font-semibold">{item.name}</span>
                  <span className="block text-sm text-ink-soft">{item.licenseNumber} · {item.city || "Sin ciudad"}</span>
                  <span className="mt-1 inline-flex rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-secondary">{item.documentCount} documentos</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>

        {detail && detail.id === (selected?.id ?? selectedId) ? (
          <Panel className="space-y-5">
            <div className="flex flex-col gap-3 border-b border-surface-high pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar initials={initials(detail.name)} className="h-14 w-14" />
                <div>
                  <h2 className="font-display text-xl font-semibold">{detail.name}</h2>
                  <p className="text-sm text-ink-soft">{detail.email} · {detail.licenseNumber}</p>
                </div>
              </div>
              <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{verificationLabel[detail.verificationStatus]}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Fact label="Ciudad" value={[detail.city, detail.department, detail.country].filter(Boolean).join(", ") || "Sin ciudad"} />
              <Fact label="Título" value={detail.title || "Sin título"} />
              <Fact label="Cuenta" value={detail.isActive ? "Activa" : "Inactiva"} />
            </div>
            <div>
              <h3 className="font-display font-semibold">Especialidades</h3>
              <p className="mt-2 text-sm text-ink-soft">{detail.specialties.length > 0 ? detail.specialties.map((item) => item.name).join(", ") : "El perfil no trae especialidades."}</p>
            </div>
            <div>
              <h3 className="font-display font-semibold">Experiencia</h3>
              {detail.workExperiences.length === 0 ? <p className="mt-2 text-sm text-ink-soft">Sin experiencia registrada.</p> : null}
              <ul className="mt-2 space-y-2">
                {detail.workExperiences.map((item) => (
                  <li key={item.id} className="rounded-xl bg-surface-low px-3 py-2 text-sm">
                    <span className="font-semibold">{item.roleTitle}</span> · {item.companyName}
                    <span className="block text-xs text-ink-soft">{item.startDate}{item.endDate ? ` – ${item.endDate}` : " – actual"}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold">Documentos</h3>
              {detail.documents.length === 0 ? <p className="mt-2 text-sm text-ink-soft">No hay documentos cargados. El API no entrega un cotejo RETHUS aparte del archivo que subió el profesional.</p> : null}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {detail.documents.map((file) => (
                  <label key={file.id} className="rounded-xl bg-surface-low p-3 text-sm">
                    <span className="flex items-start gap-2">
                      <input type="checkbox" checked={documentIds.includes(file.id)} onChange={() => toggleDocument(file.id)} />
                      <span>
                        <span className="block font-semibold">{file.fileName || "Documento sin nombre"}</span>
                        <span className="block text-xs text-ink-soft">{documentTypeLabel[file.type] ?? file.type} · {verificationLabel[file.status as VerificationStatus] ?? file.status}</span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {detail.bio ? <p className="rounded-xl bg-surface-low p-3 text-sm leading-6">{detail.bio}</p> : null}
            {detail.decisions.length > 0 ? (
              <div>
                <h3 className="font-display font-semibold">Decisiones</h3>
                <ul className="mt-2 space-y-2">
                  {detail.decisions.map((item) => (
                    <li key={`${item.action}-${item.at}`} className="rounded-xl bg-surface-low px-3 py-2 text-sm">
                      <span className="font-semibold">{decisionLabel[item.action] ?? item.action}</span>
                      <span className="block text-xs text-ink-soft">{when(item.at)}{item.notes ? ` · ${item.notes}` : ""}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <label className="block text-sm font-semibold" htmlFor="decision-notes">
              Nota de la decisión
              <textarea id="decision-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Obligatoria para rechazar o pedir corrección" className="mt-2 min-h-24 w-full rounded-xl bg-surface-low px-3 py-2 font-normal outline-none" />
            </label>
            {actionError ? <p className="text-sm text-secondary">{actionError}</p> : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={busy} className="rounded-xl bg-surface-mid px-4 py-3 text-sm font-semibold disabled:opacity-60" onClick={() => void run("reject")}>Rechazar solicitud</button>
              <button type="button" disabled={busy} className="rounded-xl bg-surface-mid px-4 py-3 text-sm font-semibold disabled:opacity-60" onClick={() => void run("changes")}>Solicitar corrección</button>
              <button type="button" disabled={busy} className="rounded-xl bg-primary-container px-4 py-3 font-display text-sm font-semibold text-white disabled:opacity-60" onClick={() => void run("approve")}>Aprobar</button>
            </div>
          </Panel>
        ) : (
          <Panel>
            <p className="text-sm text-ink-soft">{detailError || (selectedId ? "Cargando el expediente…" : "Selecciona una solicitud para revisarla.")}</p>
          </Panel>
        )}
      </div>
    </div>
  );
}

function count(items: VerificationItem[] | undefined, loading: boolean) {
  if (loading && !items) return "…";
  return String(items?.length ?? 0);
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-low p-3">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
