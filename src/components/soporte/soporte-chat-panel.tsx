"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Textarea } from "@/components/admin/ui/textarea";
import { formatDateTime } from "@/lib/format";
import {
  SOPORTE_STATUS_LABELS,
  soporteStatusVariant,
} from "@/lib/admin/soporte/labels";
import {
  useSendSoporteMessage,
  useSoporteAction,
} from "@/lib/admin/soporte/queries";
import type { SoporteConversationDetail } from "@/lib/admin/soporte/types";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  ChevronLeft,
  History,
  MessageSquare,
  Paperclip,
  Send,
  Ticket,
} from "lucide-react";
import { useRef, useState } from "react";

interface SoporteChatPanelProps {
  conversationId: string | null;
  detail?: SoporteConversationDetail;
  isLoading?: boolean;
  isError?: boolean;
  onBack?: () => void;
  showBack?: boolean;
  className?: string;
}

export function SoporteChatPanel({
  conversationId,
  detail,
  isLoading,
  isError,
  onBack,
  showBack,
  className,
}: SoporteChatPanelProps) {
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMutation = useSendSoporteMessage(conversationId);
  const actionMutation = useSoporteAction(conversationId);

  async function handleSend() {
    if (!message.trim()) return;
    setFeedback(null);

    try {
      await sendMutation.mutateAsync({ content: message.trim() });
      setMessage("");
      setFeedback("Mensaje enviado.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo enviar el mensaje",
      );
    }
  }

  async function handleAction(
    type: "create_ticket" | "escalate" | "close" | "view_history",
  ) {
    if (type === "view_history") {
      setShowHistory((prev) => !prev);
      return;
    }

    setFeedback(null);
    try {
      await actionMutation.mutateAsync({ type });
      setFeedback("Acción registrada correctamente.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo ejecutar la acción",
      );
    }
  }

  if (!conversationId) {
    return (
      <div
        className={cn(
          "flex h-full flex-col items-center justify-center bg-mu-accent/60 p-6 text-center",
          className,
        )}
      >
        <MessageSquare className="h-10 w-10 text-mu-text-muted/40" />
        <p className="mt-4 text-sm font-medium text-mu-text">
          Selecciona una conversación
        </p>
        <p className="mt-1 max-w-xs text-sm text-mu-text-muted">
          Elige una conversación del panel izquierdo para ver el chat y gestionar
          el soporte.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex h-full flex-col bg-white", className)}>
        <div className="border-b border-mu-border p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-24" />
        </div>
        <div className="flex-1 space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-3/4 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center bg-white p-6 text-sm text-mu-text-muted",
          className,
        )}
      >
        No se pudo cargar la conversación.
      </div>
    );
  }

  const { conversation, messages, history } = detail;

  return (
    <div className={cn("flex h-full flex-col bg-white", className)}>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-mu-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-mu-text-muted hover:bg-mu-accent lg:hidden"
              aria-label="Volver a conversaciones"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
          <div className="min-w-0">
            <p className="truncate font-medium text-mu-text">
              {conversation.userAlias}
            </p>
            <p className="truncate text-xs text-mu-text-muted">
              {conversation.subject}
            </p>
          </div>
        </div>
        <Badge variant={soporteStatusVariant(conversation.status)}>
          {SOPORTE_STATUS_LABELS[conversation.status]}
        </Badge>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 border-b border-mu-border px-4 py-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleAction("create_ticket")}
          loading={actionMutation.isPending}
        >
          <Ticket className="h-3.5 w-3.5" />
          Crear ticket
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleAction("escalate")}
          loading={actionMutation.isPending}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Escalar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleAction("close")}
          loading={actionMutation.isPending}
        >
          Cerrar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleAction("view_history")}
        >
          <History className="h-3.5 w-3.5" />
          Ver historial
        </Button>
      </div>

      {showHistory ? (
        <div className="shrink-0 border-b border-mu-border bg-mu-accent/60 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-mu-text-muted">
            Historial
          </p>
          {history.length === 0 ? (
            <p className="mt-2 text-sm text-mu-text-muted">
              Sin eventos registrados
            </p>
          ) : (
            <ul className="mt-2 max-h-32 space-y-2 overflow-y-auto">
              {history.map((entry) => (
                <li key={entry.id} className="text-xs text-mu-text-muted">
                  <span className="font-medium text-mu-text">{entry.action}</span>
                  {" · "}
                  {entry.performedBy} · {formatDateTime(entry.createdAt)}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[160px] items-center justify-center rounded-xl border border-dashed border-mu-border text-sm text-mu-text-muted">
            Sin mensajes en esta conversación
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={cn(
                  "flex",
                  msg.sender === "agent" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5",
                    msg.sender === "agent"
                      ? "bg-mu-primary text-white"
                      : msg.sender === "system"
                        ? "bg-mu-accent text-mu-text-muted"
                        : "bg-mu-accent text-mu-text",
                  )}
                >
                  {msg.sender !== "system" ? (
                    <p className="mb-1 text-[10px] font-medium opacity-80">
                      {msg.senderName}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      msg.sender === "agent"
                        ? "text-white/70"
                        : "text-mu-text-muted",
                    )}
                  >
                    {formatDateTime(msg.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {feedback ? (
        <p
          className={cn(
            "shrink-0 px-4 py-2 text-xs",
            feedback.includes("correctamente") || feedback.includes("enviado")
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700",
          )}
        >
          {feedback}
        </p>
      ) : null}

      <div className="shrink-0 border-t border-mu-border p-4">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={() => {
              setFeedback("Adjuntar archivos estará disponible con el backend.");
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-mu-border text-mu-text-muted transition-colors hover:bg-mu-accent"
            aria-label="Adjuntar archivo"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje…"
            className="min-h-[44px] max-h-32 resize-none py-2.5"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <Button
            type="button"
            onClick={() => void handleSend()}
            loading={sendMutation.isPending}
            disabled={!message.trim() || sendMutation.isPending}
            className="shrink-0"
            aria-label="Enviar mensaje"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
