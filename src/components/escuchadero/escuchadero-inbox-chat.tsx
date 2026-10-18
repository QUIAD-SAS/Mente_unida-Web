"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Textarea } from "@/components/admin/ui/textarea";
import { formatDateTime } from "@/lib/format";
import {
  ESCUCHADERO_PRIORITY_LABELS,
  ESCUCHADERO_STATUS_LABELS,
  priorityBadgeVariant,
  statusBadgeVariant,
} from "@/lib/admin/escuchadero/labels";
import {
  useEscuchaderoAction,
  useEscuchaderoClinicalAction,
} from "@/lib/admin/escuchadero/queries";
import type { EscuchaderoMessageDetail } from "@/lib/admin/escuchadero/types";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  MessageCircle,
  MoreVertical,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

function initials(alias: string) {
  return alias
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "P";
}

interface EscuchaderoInboxChatProps {
  conversationId: string | null;
  detail?: EscuchaderoMessageDetail;
  isLoading?: boolean;
  isError?: boolean;
  onBack?: () => void;
  showBack?: boolean;
  className?: string;
}

export function EscuchaderoInboxChat({
  conversationId,
  detail,
  isLoading,
  isError,
  onBack,
  showBack,
  className,
}: EscuchaderoInboxChatProps) {
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const actionMutation = useEscuchaderoAction(conversationId);
  const clinicalMutation = useEscuchaderoClinicalAction(conversationId);

  const thread = detail?.thread ?? [];
  const isClosed = detail?.status === "closed";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, conversationId]);

  useEffect(() => {
    setDraft("");
    setFeedback(null);
    setMenuOpen(false);
  }, [conversationId]);

  async function handleSend() {
    const content = draft.trim();
    if (!content || isClosed) return;
    setFeedback(null);
    try {
      await actionMutation.mutateAsync({ type: "respond", content });
      setDraft("");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo enviar el mensaje",
      );
    }
  }

  async function handleClose() {
    setMenuOpen(false);
    setFeedback(null);
    try {
      await actionMutation.mutateAsync({ type: "close" });
      setFeedback("Conversación cerrada.");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo cerrar la conversación",
      );
    }
  }

  async function handleClinicalAction(
    action:
      | { kind: "risk"; level: number; notes?: string }
      | { kind: "follow-up"; notes?: string }
      | { kind: "clinical-support"; reason: string; notes?: string }
      | { kind: "emergency"; type: string; severity: string; message: string; confirmed: true }
      | { kind: "identity-request"; reason: string },
    success: string,
  ) {
    setMenuOpen(false);
    setFeedback(null);
    try {
      await clinicalMutation.mutateAsync(action);
      setFeedback(success);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo guardar la acción clínica");
    }
  }

  function requestRisk() {
    const raw = window.prompt("Nivel de riesgo (0 a 4):", "3");
    if (raw === null) return;
    const level = Number(raw);
    if (!Number.isInteger(level) || level < 0 || level > 4) {
      setFeedback("El nivel de riesgo debe estar entre 0 y 4.");
      return;
    }
    const notes = window.prompt("Notas clínicas (opcional):") ?? undefined;
    void handleClinicalAction({ kind: "risk", level, notes }, "Riesgo evaluado.");
  }

  function requestFollowUp() {
    const notes = window.prompt("Notas de seguimiento (opcional):") ?? undefined;
    void handleClinicalAction({ kind: "follow-up", notes }, "Seguimiento creado.");
  }

  function requestClinicalSupport() {
    const reason = window.prompt("Motivo para solicitar apoyo clínico:");
    if (!reason?.trim()) return;
    const notes = window.prompt("Notas adicionales (opcional):") ?? undefined;
    void handleClinicalAction({ kind: "clinical-support", reason, notes }, "Solicitud de apoyo clínico creada.");
  }

  function requestEmergency() {
    const message = window.prompt("Describe la emergencia:");
    if (!message?.trim() || !window.confirm("¿Confirmas activar la emergencia?")) return;
    void handleClinicalAction(
      { kind: "emergency", type: "EMERGENCY", severity: "CRITICAL", message, confirmed: true },
      "Emergencia activada y equipo notificado.",
    );
  }

  function requestIdentity() {
    const reason = window.prompt("Motivo para solicitar identidad:");
    if (!reason?.trim()) return;
    void handleClinicalAction({ kind: "identity-request", reason }, "Solicitud de identidad creada.");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  if (!conversationId) {
    return (
      <div
        className={cn(
          "flex h-full flex-col items-center justify-center bg-mu-accent/50 p-8 text-center",
          className,
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
          <MessageCircle className="h-7 w-7 text-mu-primary" />
        </div>
        <p className="mt-4 font-heading text-lg font-semibold text-mu-text">
          Selecciona una conversación
        </p>
        <p className="mt-1 max-w-sm text-sm text-mu-text-muted">
          Elige un paciente de la lista para ver el hilo y responder desde el
          escuchadero.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-white", className)}>
      <header className="flex shrink-0 items-center gap-3 border-b border-mu-border px-4 py-3">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-mu-text-muted hover:bg-mu-accent lg:hidden"
            aria-label="Volver a la lista"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : null}

        {isLoading && !detail ? (
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ) : (
          <>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mu-primary text-sm font-semibold text-white">
              {initials(detail?.alias ?? "?")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-base font-semibold text-mu-text">
                {detail?.alias ?? "Paciente"}
              </p>
              <p className="truncate text-xs text-mu-text-muted">
                {isClosed
                  ? "Conversación cerrada"
                  : "Activo en el escuchadero"}
              </p>
            </div>
            {detail ? (
              <div className="hidden items-center gap-1.5 sm:flex">
                <Badge variant={statusBadgeVariant(detail.status)}>
                  {ESCUCHADERO_STATUS_LABELS[detail.status]}
                </Badge>
                <Badge variant={priorityBadgeVariant(detail.priority)}>
                  {ESCUCHADERO_PRIORITY_LABELS[detail.priority]}
                </Badge>
              </div>
            ) : null}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-mu-text-muted hover:bg-mu-accent"
                aria-label="Más opciones"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-mu-border bg-white p-1 shadow-lg">
                  <button type="button" disabled={clinicalMutation.isPending} onClick={requestRisk} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-mu-accent disabled:opacity-50">Evaluar riesgo</button>
                  <button type="button" disabled={clinicalMutation.isPending} onClick={requestFollowUp} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-mu-accent disabled:opacity-50">Crear seguimiento</button>
                  <button type="button" disabled={clinicalMutation.isPending} onClick={requestClinicalSupport} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-mu-accent disabled:opacity-50">Solicitar apoyo clínico</button>
                  <button type="button" disabled={clinicalMutation.isPending} onClick={requestIdentity} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-mu-accent disabled:opacity-50">Solicitar identidad</button>
                  <button type="button" disabled={clinicalMutation.isPending} onClick={requestEmergency} className="w-full rounded-lg px-3 py-2 text-left text-sm text-mu-error hover:bg-mu-accent disabled:opacity-50">Activar emergencia</button>
                  <button
                    type="button"
                    disabled={isClosed || actionMutation.isPending}
                    onClick={() => void handleClose()}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-mu-error hover:bg-mu-accent disabled:opacity-50"
                  >
                    Cerrar conversación
                  </button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f9fc] px-4 py-4">
        {isLoading && !detail ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "h-14 rounded-2xl",
                  i % 2 === 0 ? "ml-10 w-2/3" : "mr-10 ml-auto w-1/2",
                )}
              />
            ))}
          </div>
        ) : isError ? (
          <p className="rounded-2xl border border-dashed border-mu-border bg-white px-4 py-8 text-center text-sm text-mu-text-muted">
            No se pudo cargar la conversación.
          </p>
        ) : thread.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-mu-border bg-white px-4 py-8 text-center text-sm text-mu-text-muted">
            Aún no hay mensajes en este hilo.
          </p>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {thread.map((msg) => {
              if (msg.sender === "SYSTEM") {
                return (
                  <li key={msg.id} className="text-center">
                    <span className="inline-block max-w-[90%] rounded-full bg-white px-3 py-1 text-[11px] text-mu-text-muted shadow-sm">
                      {msg.content}
                    </span>
                  </li>
                );
              }

              const isTeam =
                msg.sender === "PSYCHOLOGIST" || msg.sender === "AI";

              return (
                <li
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-1",
                    isTeam ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                      isTeam
                        ? "rounded-br-md bg-mu-primary text-white"
                        : "rounded-bl-md bg-[#eceff3] text-mu-text",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="px-1 text-[10px] text-mu-text-muted">
                    {formatDateTime(msg.createdAt)}
                  </span>
                </li>
              );
            })}
            <div ref={bottomRef} />
          </ul>
        )}
      </div>

      <footer className="shrink-0 border-t border-mu-border bg-white p-4">
        {feedback ? (
          <p
            className={cn(
              "mb-2 rounded-xl px-3 py-1.5 text-xs",
              feedback.includes("cerrada")
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700",
            )}
          >
            {feedback}
          </p>
        ) : null}

        {isClosed ? (
          <p className="rounded-2xl bg-mu-accent px-4 py-3 text-center text-sm text-mu-text-muted">
            Esta conversación está cerrada.
          </p>
        ) : (
          <div className="flex items-end gap-3">
            <div className="flex min-h-[52px] flex-1 items-end rounded-2xl bg-mu-accent px-3 py-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Escribe tu mensaje aquí…"
                className="min-h-[36px] max-h-28 flex-1 resize-none border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
                rows={1}
                disabled={actionMutation.isPending}
              />
            </div>
            <Button
              type="button"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-full"
              loading={actionMutation.isPending}
              disabled={actionMutation.isPending || !draft.trim()}
              onClick={() => void handleSend()}
              aria-label="Enviar mensaje"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </footer>
    </div>
  );
}
