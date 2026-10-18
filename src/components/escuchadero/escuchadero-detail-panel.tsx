"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Textarea } from "@/components/admin/ui/textarea";
import { formatDateTime } from "@/lib/format";
import {
  ESCUCHADERO_PRIORITY_LABELS,
  ESCUCHADERO_STATUS_LABELS,
  priorityBadgeVariant,
  statusBadgeVariant,
} from "@/lib/admin/escuchadero/labels";
import { useEscuchaderoAction } from "@/lib/admin/escuchadero/queries";
import type {
  EscuchaderoActionType,
  EscuchaderoMessageDetail,
} from "@/lib/admin/escuchadero/types";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  FileText,
  MessageCircle,
  MessageSquare,
  Paperclip,
  StickyNote,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";

interface EscuchaderoDetailPanelProps {
  open: boolean;
  message?: EscuchaderoMessageDetail;
  isLoading?: boolean;
  isError?: boolean;
  onClose: () => void;
  onOpenChat?: () => void;
}

type ActionMode = EscuchaderoActionType | null;

export function EscuchaderoDetailPanel({
  open,
  message,
  isLoading,
  isError,
  onClose,
  onOpenChat,
}: EscuchaderoDetailPanelProps) {
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [content, setContent] = useState("");
  const [assignee, setAssignee] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const actionMutation = useEscuchaderoAction(message?.id ?? null);

  function resetActionForm() {
    setActionMode(null);
    setContent("");
    setAssignee("");
  }

  async function handleAction(type: EscuchaderoActionType) {
    setFeedback(null);

    try {
      await actionMutation.mutateAsync({
        type,
        content: content.trim() || undefined,
        assignee: assignee.trim() || undefined,
      });
      setFeedback("Acción registrada correctamente.");
      resetActionForm();
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo ejecutar la acción",
      );
    }
  }

  function openAction(mode: ActionMode) {
    setFeedback(null);
    setActionMode(mode);
    setContent("");
    setAssignee("");
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-mu-border bg-white shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Detalle del mensaje"
        aria-hidden={!open}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-mu-border px-5">
          <h2 className="font-heading text-base font-semibold text-mu-text">
            Detalle del mensaje
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-mu-text-muted hover:bg-mu-accent"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <PanelSkeleton />
          ) : isError || !message ? (
            <div className="rounded-xl border border-dashed border-mu-border bg-mu-accent/80 px-4 py-8 text-center text-sm text-mu-text-muted">
              No se pudo cargar el detalle del mensaje.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusBadgeVariant(message.status)}>
                    {ESCUCHADERO_STATUS_LABELS[message.status]}
                  </Badge>
                  <Badge variant={priorityBadgeVariant(message.priority)}>
                    {ESCUCHADERO_PRIORITY_LABELS[message.priority]}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                    Alias
                  </p>
                  <p className="mt-1 font-medium text-mu-text">{message.alias}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                    Fecha
                  </p>
                  <p className="mt-1 text-sm text-mu-text">
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                    Asunto
                  </p>
                  <p className="mt-1 text-sm font-medium text-mu-text">
                    {message.subject}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
                    Mensaje
                  </p>
                  <p className="mt-2 whitespace-pre-wrap rounded-xl bg-mu-accent p-4 text-sm leading-relaxed text-mu-text">
                    {message.message}
                  </p>
                </div>
              </div>

              <Section title="Archivos" icon={Paperclip}>
                {message.attachments.length === 0 ? (
                  <EmptySection text="Sin archivos adjuntos" />
                ) : (
                  <ul className="space-y-2">
                    {message.attachments.map((file) => (
                      <li key={file.id}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-mu-border px-3 py-2 text-sm text-mu-primary hover:bg-mu-accent"
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Historial" icon={MessageSquare}>
                {message.history.length === 0 ? (
                  <EmptySection text="Sin eventos registrados" />
                ) : (
                  <ul className="space-y-3">
                    {message.history.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-xl border border-mu-border px-3 py-2.5"
                      >
                        <p className="text-sm font-medium text-mu-text">
                          {entry.action}
                        </p>
                        <p className="mt-0.5 text-xs text-mu-text-muted">
                          {entry.performedBy} · {formatDateTime(entry.createdAt)}
                        </p>
                        {entry.details ? (
                          <p className="mt-1 text-xs text-mu-text-muted">
                            {entry.details}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Notas internas" icon={StickyNote}>
                {message.internalNotes.length === 0 ? (
                  <EmptySection text="Sin notas internas" />
                ) : (
                  <ul className="space-y-3">
                    {message.internalNotes.map((note) => (
                      <li
                        key={note.id}
                        className="rounded-xl bg-amber-50/80 px-3 py-2.5"
                      >
                        <p className="text-sm text-mu-text">{note.content}</p>
                        <p className="mt-1 text-xs text-mu-text-muted">
                          {note.author} · {formatDateTime(note.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {actionMode ? (
                <div className="rounded-xl border border-mu-border bg-mu-accent/60 p-4">
                  <p className="text-sm font-medium text-mu-text">
                    {actionMode === "respond" && "Responder mensaje"}
                    {actionMode === "assign" && "Asignar mensaje"}
                    {actionMode === "escalate" && "Escalar mensaje"}
                    {actionMode === "close" && "Cerrar mensaje"}
                    {actionMode === "add_note" && "Agregar nota interna"}
                  </p>

                  {(actionMode === "respond" || actionMode === "add_note") && (
                    <div className="mt-3">
                      <Label htmlFor="action-content">
                        {actionMode === "respond" ? "Respuesta" : "Nota"}
                      </Label>
                      <Textarea
                        id="action-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={
                          actionMode === "respond"
                            ? "Escribe la respuesta al paciente…"
                            : "Escribe una nota interna…"
                        }
                        className="mt-1.5"
                      />
                    </div>
                  )}

                  {actionMode === "assign" && (
                    <div className="mt-3">
                      <Label htmlFor="assignee">Asignar a</Label>
                      <Input
                        id="assignee"
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                        placeholder="Nombre del administrador"
                        className="mt-1.5"
                      />
                    </div>
                  )}

                  {(actionMode === "escalate" || actionMode === "close") && (
                    <p className="mt-2 text-sm text-mu-text-muted">
                      Esta acción quedará registrada en el historial de
                      auditoría del mensaje.
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      loading={actionMutation.isPending}
                      disabled={
                        actionMutation.isPending ||
                        ((actionMode === "respond" || actionMode === "add_note") &&
                          !content.trim()) ||
                        (actionMode === "assign" && !assignee.trim())
                      }
                      onClick={() => void handleAction(actionMode)}
                    >
                      Confirmar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetActionForm}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : null}

              {feedback ? (
                <p
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm",
                    feedback.includes("correctamente")
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700",
                  )}
                  role="status"
                >
                  {feedback}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {message && !isLoading ? (
          <div className="shrink-0 border-t border-mu-border p-4">
            {onOpenChat && message.status !== "closed" ? (
              <Button
                type="button"
                className="mb-3 w-full"
                onClick={onOpenChat}
              >
                <MessageCircle className="h-4 w-4" />
                Abrir conversación
              </Button>
            ) : null}
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mu-text-muted">
              Acciones
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openAction("respond")}
              >
                <MessageSquare className="h-4 w-4" />
                Responder
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openAction("assign")}
              >
                <UserPlus className="h-4 w-4" />
                Asignar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openAction("escalate")}
              >
                <ArrowUpRight className="h-4 w-4" />
                Escalar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openAction("close")}
              >
                Cerrar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="col-span-2"
                onClick={() => openAction("add_note")}
              >
                <StickyNote className="h-4 w-4" />
                Agregar nota
              </Button>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-mu-primary" aria-hidden />
        <h3 className="text-sm font-semibold text-mu-text">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function EmptySection({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-mu-border px-3 py-4 text-sm text-mu-text-muted">
      {text}
    </p>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
