"use client";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api-client";
import type {
  AiChatAssistResponse,
  ChatConversation,
  ChatMessage,
  SupportInboxSession,
} from "@/lib/api/types";
import { useAuthStore } from "@/lib/auth/store";
import { useChatTyping } from "@/lib/chat/use-chat-typing";
import { cn } from "@/lib/utils";
import { Bot, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const POLL_MS = 5000;
const LIST_REFRESH_MS = 30000;

type Channel = "support" | "appointment";

function formatPreview(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function TabUnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-mu-error px-1 text-[9px] font-semibold text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function PsychologistMessagingView() {
  const token = useAuthStore((s) => s.token)!;
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId");

  const [channel, setChannel] = useState<Channel>("support");
  const [supportSessions, setSupportSessions] = useState<SupportInboxSession[]>(
    [],
  );
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedSupportId, setSelectedSupportId] = useState<string | null>(
    null,
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<AiChatAssistResponse | null>(
    null,
  );

  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handledPatientRef = useRef<string | null>(null);

  const selectedSupport =
    supportSessions.find((s) => s.id === selectedSupportId) ?? null;
  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) ?? null;

  const loadSupportInbox = useCallback(async () => {
    const list = await api.messaging.support.inbox(token);
    setSupportSessions(list);
    if (!selectedSupportId && list[0]) {
      setSelectedSupportId(list[0].id);
    }
  }, [token, selectedSupportId]);

  const loadConversations = useCallback(async () => {
    const list = await api.messaging.conversations.list(token);
    setConversations(list);
    if (!selectedConversationId && list[0]) {
      setSelectedConversationId(list[0].id);
    }
  }, [token, selectedConversationId]);

  const loadLists = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([loadSupportInbox(), loadConversations()]);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Error al cargar mensajes",
      );
    }
  }, [loadSupportInbox, loadConversations]);

  const loadMessages = useCallback(
    async (activeChannel: Channel, id: string) => {
      setLoadingMessages(true);
      setError(null);
      try {
        const msgs =
          activeChannel === "support"
            ? await api.messaging.support.getSessionMessages(token, id)
            : await api.messaging.conversations.getMessages(token, id);
        setMessages(msgs);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Error al cargar mensajes",
        );
      } finally {
        setLoadingMessages(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void loadLists().finally(() => setLoadingList(false));
  }, [loadLists]);

  useEffect(() => {
    if (!patientIdParam || loadingList) return;
    if (handledPatientRef.current === patientIdParam) return;

    const existing = conversations.find((c) => c.patientId === patientIdParam);
    if (existing) {
      handledPatientRef.current = patientIdParam;
      setChannel("appointment");
      setSelectedConversationId(existing.id);
      return;
    }

    handledPatientRef.current = patientIdParam;
    setChannel("appointment");
    void api.messaging.conversations
      .openWithPatient(token, patientIdParam)
      .then((conv) => {
        setConversations((prev) => {
          if (prev.some((c) => c.id === conv.id)) return prev;
          return [conv, ...prev];
        });
        setSelectedConversationId(conv.id);
      })
      .catch((err) => {
        handledPatientRef.current = null;
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudo abrir la conversación",
        );
      });
  }, [patientIdParam, loadingList, conversations, token]);

  const activeId =
    channel === "support" ? selectedSupportId : selectedConversationId;

  const signalTyping = useCallback(
    async (isTyping: boolean) => {
      if (!activeId) return;
      if (channel === "support") {
        await api.messaging.support.setSessionTyping(token, activeId, {
          isTyping,
        });
      } else {
        await api.messaging.conversations.setTyping(token, activeId, {
          isTyping,
        });
      }
    },
    [activeId, channel, token],
  );

  const fetchPeerTyping = useCallback(async () => {
    if (!activeId) return false;
    const status =
      channel === "support"
        ? await api.messaging.support.getSessionTyping(token, activeId)
        : await api.messaging.conversations.getTyping(token, activeId);
    return status.peerTyping;
  }, [activeId, channel, token]);

  const typingEnabled =
    Boolean(activeId) &&
    !loadingMessages &&
    (channel === "support" || Boolean(selectedConversation?.hasActiveAppointment));

  const { peerTyping, onInputChange, stopTyping } = useChatTyping({
    enabled: typingEnabled,
    signalTyping,
    fetchPeerTyping,
  });

  const typingLabel =
    channel === "support"
      ? selectedSupport
        ? `${selectedSupport.patientAlias} está escribiendo`
        : "El paciente está escribiendo"
      : selectedConversation
        ? `${selectedConversation.patientAlias} está escribiendo`
        : "El paciente está escribiendo";

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    setAiSuggestion(null);
    void loadMessages(channel, activeId);
  }, [channel, activeId, loadMessages]);

  useEffect(() => {
    if (!activeId) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const fetchMessages =
        channel === "support"
          ? api.messaging.support.getSessionMessages(token, activeId)
          : api.messaging.conversations.getMessages(token, activeId);
      void fetchMessages.then(setMessages).catch(() => undefined);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [channel, activeId, token]);

  useEffect(() => {
    if (!activeId) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void loadLists();
    }, LIST_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [activeId, loadLists]);

  async function handleSend(content: string) {
    if (!activeId) return;
    const msg =
      channel === "support"
        ? await api.messaging.support.sendSessionMessage(token, activeId, {
            content,
          })
        : await api.messaging.conversations.sendMessage(token, activeId, {
            content,
          });
    setMessages((prev) => [...prev, msg]);
    void loadLists();
  }

  async function handleAiAssist() {
    if (!selectedConversationId) return;
    setAiLoading(true);
    setError(null);
    try {
      const res = await api.messaging.ai.assist(token, {
        conversationId: selectedConversationId,
      });
      setAiSuggestion(res);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No pudimos obtener ayuda de IA",
      );
    } finally {
      setAiLoading(false);
    }
  }

  function insertAiSuggestion() {
    if (!aiSuggestion) return;
    void handleSend(aiSuggestion.content);
    setAiSuggestion(null);
  }

  const listEmpty =
    channel === "support"
      ? supportSessions.length === 0
      : conversations.length === 0;

  const canSend =
    channel === "support"
      ? Boolean(selectedSupport)
      : Boolean(selectedConversation?.hasActiveAppointment);

  const sendPlaceholder =
    channel === "support"
      ? "Mensaje al paciente en escuchadero…"
      : selectedConversation?.hasActiveAppointment
        ? "Mensaje al paciente…"
        : "Requiere cita activa";

  const supportUnread = supportSessions.reduce(
    (sum, s) => sum + (s.unreadCount ?? 0),
    0,
  );
  const appointmentUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount ?? 0),
    0,
  );

  return (
    <DashboardShell role="psychologist" contained>
      <header className="shrink-0">
          <h1 className="font-heading text-2xl font-bold text-mu-text">
            Mensajes
          </h1>
          <p className="mt-1 text-sm text-mu-text-muted">
            Escuchadero y conversaciones con pacientes que tienen cita contigo.
          </p>
        </header>

        {error ? (
          <p
            className="mt-4 rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
          <Card className="flex max-h-full min-h-0 w-full shrink-0 flex-col overflow-hidden lg:w-72">
            <div className="flex shrink-0 border-b border-mu-border">
              <button
                type="button"
                onClick={() => setChannel("support")}
                className={cn(
                  "relative flex flex-1 items-center justify-center px-3 py-2.5 text-sm font-medium transition-colors",
                  channel === "support"
                    ? "border-b-2 border-mu-primary text-mu-primary"
                    : "text-mu-text-muted hover:text-mu-text",
                )}
              >
                Escuchadero
                <TabUnreadBadge count={supportUnread} />
              </button>
              <button
                type="button"
                onClick={() => setChannel("appointment")}
                className={cn(
                  "relative flex flex-1 items-center justify-center px-3 py-2.5 text-sm font-medium transition-colors",
                  channel === "appointment"
                    ? "border-b-2 border-mu-primary text-mu-primary"
                    : "text-mu-text-muted hover:text-mu-text",
                )}
              >
                Citas
                <TabUnreadBadge count={appointmentUnread} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {loadingList ? (
              <p className="p-4 text-sm text-mu-text-muted">Cargando…</p>
            ) : listEmpty ? (
              <p className="p-4 text-sm text-mu-text-muted">
                {channel === "support"
                  ? "No hay pacientes en escuchadero asignados a ti."
                  : "No hay conversaciones. Solo puedes escribir a pacientes con cita activa."}
              </p>
            ) : channel === "support" ? (
              <ul>
                {supportSessions.map((s) => {
                  const active = s.id === selectedSupportId;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedSupportId(s.id)}
                        className={cn(
                          "w-full border-b border-mu-border px-4 py-3 text-left text-sm transition-colors",
                          active
                            ? "bg-mu-accent/50"
                            : "hover:bg-mu-background",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-mu-primary">
                            {s.patientAlias}
                          </span>
                          {s.unreadCount > 0 ? (
                            <span className="rounded-full bg-mu-primary px-1.5 text-[10px] text-white">
                              {s.unreadCount}
                            </span>
                          ) : null}
                        </div>
                        {s.lastMessage ? (
                          <p className="mt-1 line-clamp-1 text-xs text-mu-text-muted">
                            {s.lastMessage.content}
                          </p>
                        ) : null}
                        <p className="mt-0.5 text-[10px] text-mu-text-muted">
                          {formatPreview(s.updatedAt)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul>
                {conversations.map((c) => {
                  const active = c.id === selectedConversationId;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedConversationId(c.id)}
                        className={cn(
                          "w-full border-b border-mu-border px-4 py-3 text-left text-sm transition-colors",
                          active
                            ? "bg-mu-accent/50"
                            : "hover:bg-mu-background",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-mu-primary">
                            {c.patientAlias}
                          </span>
                          {c.unreadCount > 0 ? (
                            <span className="rounded-full bg-mu-primary px-1.5 text-[10px] text-white">
                              {c.unreadCount}
                            </span>
                          ) : null}
                        </div>
                        {c.lastMessage ? (
                          <p className="mt-1 line-clamp-1 text-xs text-mu-text-muted">
                            {c.lastMessage.content}
                          </p>
                        ) : null}
                        <p className="mt-0.5 text-[10px] text-mu-text-muted">
                          {formatPreview(c.updatedAt)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            </div>
          </Card>

          <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {channel === "support" && selectedSupport ? (
              <>
                <header className="flex shrink-0 items-center justify-between gap-2 border-b border-mu-border px-4 py-3">
                  <div>
                    <h2 className="text-sm font-semibold">
                      {selectedSupport.patientAlias}
                    </h2>
                    <p className="text-xs text-mu-text-muted">
                      Escuchadero · {selectedSupport.caseStatus}
                      {selectedSupport.currentRiskLevel !== null
                        ? ` · Riesgo ${selectedSupport.currentRiskLevel}/4`
                        : ""}
                    </p>
                  </div>
                </header>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  {loadingMessages ? (
                    <p className="flex flex-1 items-center justify-center gap-2 text-sm text-mu-text-muted">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Cargando mensajes…
                    </p>
                  ) : (
                    <>
                      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
                        <ChatMessageList
                          messages={messages}
                          ownSenders={["PSYCHOLOGIST"]}
                          emptyLabel="El paciente aún no ha escrito en el escuchadero."
                          className="h-full"
                          peerTyping={peerTyping}
                          typingLabel={typingLabel}
                          compactTyping
                        />
                      </div>
                      <div className="shrink-0 px-4 pb-3">
                        <ChatInput
                          onSend={handleSend}
                          onTypingChange={onInputChange}
                          onTypingStop={stopTyping}
                          placeholder={sendPlaceholder}
                          className="border-t-0 pt-0"
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : channel === "appointment" && selectedConversation ? (
              <>
                <header className="flex shrink-0 items-center justify-between gap-2 border-b border-mu-border px-4 py-3">
                  <div>
                    <h2 className="text-sm font-semibold">
                      {selectedConversation.patientAlias}
                    </h2>
                    <p className="text-xs text-mu-text-muted">
                      {selectedConversation.hasActiveAppointment
                        ? "Cita activa"
                        : "Sin cita activa"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAiAssist}
                    loading={aiLoading}
                    disabled={!selectedConversation.hasActiveAppointment}
                  >
                    <Bot className="h-4 w-4" aria-hidden />
                    IA
                  </Button>
                </header>

                {aiSuggestion ? (
                  <div className="shrink-0 border-b border-mu-border bg-mu-background px-4 py-3">
                    <p className="text-xs font-medium text-mu-text-muted">
                      Sugerencia IA (solo tú la ves)
                    </p>
                    <p className="mt-1 text-sm">{aiSuggestion.content}</p>
                    {aiSuggestion.disclaimer ? (
                      <p className="mt-1 text-[10px] text-mu-text-muted">
                        {aiSuggestion.disclaimer}
                      </p>
                    ) : null}
                    <div className="mt-2 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setAiSuggestion(null)}
                      >
                        Descartar
                      </Button>
                      <Button type="button" size="sm" onClick={insertAiSuggestion}>
                        Enviar al paciente
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  {loadingMessages ? (
                    <p className="flex flex-1 items-center justify-center gap-2 text-sm text-mu-text-muted">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Cargando mensajes…
                    </p>
                  ) : (
                    <>
                      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
                        <ChatMessageList
                          messages={messages}
                          ownSenders={["PSYCHOLOGIST"]}
                          emptyLabel="Inicia la conversación con tu paciente."
                          className="h-full"
                          peerTyping={peerTyping}
                          typingLabel={typingLabel}
                          compactTyping
                        />
                      </div>
                      <div className="shrink-0 px-4 pb-3">
                        <ChatInput
                          onSend={handleSend}
                          onTypingChange={onInputChange}
                          onTypingStop={stopTyping}
                          disabled={!canSend}
                          placeholder={sendPlaceholder}
                          className="border-t-0 pt-0"
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <p className="flex flex-1 items-center justify-center p-6 text-sm text-mu-text-muted">
                Selecciona una conversación
              </p>
            )}
          </Card>
        </div>
    </DashboardShell>
  );
}
