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
import { useEscuchaderoAction } from "@/lib/admin/escuchadero/queries";
import type { EscuchaderoMessageDetail } from "@/lib/admin/escuchadero/types";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface EscuchaderoChatPanelProps {
  open: boolean;
  detail?: EscuchaderoMessageDetail;
  isLoading?: boolean;
  isError?: boolean;
  onClose: () => void;
}

export function EscuchaderoChatPanel({
  open,
  detail,
  isLoading,
  isError,
  onClose,
}: EscuchaderoChatPanelProps) {
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const actionMutation = useEscuchaderoAction(detail?.id ?? null);

  const thread = detail?.thread ?? [];
  const isClosed = detail?.status === "closed";

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, thread.length, detail?.id]);

  useEffect(() => {
    if (!open) {
      setDraft("");
      setFeedback(null);
    }
  }, [open, detail?.id]);

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

  async function handleCloseConversation() {
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

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/45 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex h-[min(92dvh,720px)] w-full flex-col rounded-t-2xl border border-mu-border bg-white shadow-2xl transition-transform duration-300 sm:inset-y-6 sm:left-auto sm:right-6 sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:w-full sm:max-w-lg sm:rounded-2xl",
          open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-x-[120%]",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Conversación del escuchadero"
        aria-hidden={!open}
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-mu-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-mu-text-muted hover:bg-mu-accent sm:hidden"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 shrink-0 text-mu-primary" />
              <h2 className="truncate font-heading text-base font-semibold text-mu-text">
                {detail?.alias ?? "Conversación"}
              </h2>
            </div>
            <p className="truncate text-xs text-mu-text-muted">
              Escuchadero · responde como equipo de escucha
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

          <button
            type="button"
            onClick={onClose}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-mu-text-muted hover:bg-mu-accent sm:inline-flex"
            aria-label="Cerrar conversación"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-mu-accent/40 px-4 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    "h-14 rounded-2xl",
                    i % 2 === 0 ? "ml-8 w-3/4" : "mr-8 w-2/3",
                  )}
                />
              ))}
            </div>
          ) : isError || !detail ? (
            <p className="rounded-xl border border-dashed border-mu-border bg-white px-4 py-8 text-center text-sm text-mu-text-muted">
              No se pudo cargar la conversación.
            </p>
          ) : thread.length === 0 ? (
            <p className="rounded-xl border border-dashed border-mu-border bg-white px-4 py-8 text-center text-sm text-mu-text-muted">
              Aún no hay mensajes. El paciente escribirá desde la app.
            </p>
          ) : (
            <ul className="space-y-3">
              {thread.map((msg) => {
                if (msg.sender === "SYSTEM") {
                  return (
                    <li key={msg.id} className="text-center">
                      <span className="inline-block max-w-[90%] rounded-full bg-white/80 px-3 py-1 text-[11px] text-mu-text-muted">
                        {msg.content}
                      </span>
                    </li>
                  );
                }

                const isPatient = msg.sender === "PATIENT";
                const isTeam =
                  msg.sender === "PSYCHOLOGIST" || msg.sender === "AI";

                return (
                  <li
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-0.5",
                      isTeam ? "items-end" : "items-start",
                    )}
                  >
                    <span className="px-1 text-[10px] font-medium uppercase tracking-wide text-mu-text-muted">
                      {isPatient
                        ? detail.alias
                        : msg.sender === "AI"
                          ? "Asistente IA"
                          : "Equipo escucha"}
                    </span>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                        isTeam
                          ? "rounded-br-md bg-mu-primary text-white"
                          : "rounded-bl-md border border-mu-border bg-white text-mu-text",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          isTeam ? "text-white/70" : "text-mu-text-muted",
                        )}
                      >
                        {formatDateTime(msg.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
              <div ref={bottomRef} />
            </ul>
          )}
        </div>

        <footer className="shrink-0 border-t border-mu-border bg-white p-3">
          {feedback ? (
            <p
              className={cn(
                "mb-2 rounded-lg px-3 py-1.5 text-xs",
                feedback.includes("cerrada")
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700",
              )}
              role="status"
            >
              {feedback}
            </p>
          ) : null}

          {isClosed ? (
            <p className="rounded-xl bg-mu-accent px-3 py-3 text-center text-sm text-mu-text-muted">
              Esta conversación está cerrada.
            </p>
          ) : (
            <>
              <div className="flex items-end gap-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Escribe tu respuesta al paciente…"
                  className="min-h-[44px] max-h-32 flex-1 resize-none"
                  rows={2}
                  disabled={actionMutation.isPending || isLoading}
                />
                <Button
                  type="button"
                  size="icon"
                  className="shrink-0"
                  loading={actionMutation.isPending}
                  disabled={
                    actionMutation.isPending || !draft.trim() || isLoading
                  }
                  onClick={() => void handleSend()}
                  aria-label="Enviar mensaje"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[10px] text-mu-text-muted">
                  Enter para enviar · Shift+Enter para nueva línea
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={actionMutation.isPending}
                  onClick={() => void handleCloseConversation()}
                >
                  Cerrar conversación
                </Button>
              </div>
            </>
          )}
        </footer>
      </div>
    </>
  );
}
