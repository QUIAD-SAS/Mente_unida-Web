"use client";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatPanelShell } from "@/components/chat/chat-panel-shell";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { api, ApiError } from "@/lib/api-client";
import type { ChatConversation, ChatMessage, ChatMessageSender } from "@/lib/api/types";
import {
  countUnreadFromPeer,
  notifyNewMessage,
  requestNotificationPermission,
} from "@/lib/chat/messaging-notifications";
import { useChatTyping } from "@/lib/chat/use-chat-typing";
import { useAuthStore } from "@/lib/auth/store";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const POLL_OPEN_MS = 8_000;
const POLL_BACKGROUND_MS = 30_000;
const PANEL_HEIGHT_PX = 420;
const PANEL_WIDTH_PX = 360;

interface AppointmentSessionChatWidgetProps {
  appointmentId: string;
  ownSender: ChatMessageSender;
  peerLabel: string;
  title?: string;
}

/**
 * Chat de sesión del consultorio: FAB + panel acotado (patrón escuchadero).
 * Polling estable (refs) para no saturar el rate-limit.
 */
export function AppointmentSessionChatWidget({
  appointmentId,
  ownSender,
  peerLabel,
  title = "Chat de la sesión",
}: AppointmentSessionChatWidgetProps) {
  const token = useAuthStore((s) => s.token)!;
  const peerSenders: ChatMessageSender[] =
    ownSender === "PATIENT" ? ["PSYCHOLOGIST"] : ["PATIENT"];

  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [booting, setBooting] = useState(true);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSeenIdRef = useRef<string | null>(null);
  const openRef = useRef(open);
  const conversationIdRef = useRef<string | null>(null);
  const messageCountRef = useRef(0);
  const pollingRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);
  const peerLabelRef = useRef(peerLabel);
  const titleRef = useRef(title);
  const peerSendersRef = useRef(peerSenders);

  openRef.current = open;
  peerLabelRef.current = peerLabel;
  titleRef.current = title;
  peerSendersRef.current = peerSenders;

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  const applyMessages = useCallback((msgs: ChatMessage[]) => {
    const list = Array.isArray(msgs) ? msgs : [];
    const wasOpen = openRef.current;

    if (wasOpen) {
      lastSeenIdRef.current = list.at(-1)?.id ?? null;
      setUnreadCount(0);
      setMessages(list);
      return;
    }

    const unread = countUnreadFromPeer(
      list,
      lastSeenIdRef.current,
      peerSendersRef.current,
    );

    if (unread > 0) {
      const latest = [...list]
        .reverse()
        .find((m) => peerSendersRef.current.includes(m.sender));
      setToast("Nuevo mensaje en la sesión");
      notifyNewMessage(
        titleRef.current,
        latest?.content?.slice(0, 80) ??
          `Nuevo mensaje de ${peerLabelRef.current}`,
      );
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => setToast(null), 5000);
    }

    setUnreadCount(unread);
    setMessages(list);
  }, []);

  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (conversationIdRef.current) return conversationIdRef.current;
    const conv = await api.messaging.conversations.byAppointment(
      token,
      appointmentId,
    );
    conversationIdRef.current = conv.id;
    setConversation(conv);
    return conv.id;
  }, [appointmentId, token]);

  const fetchMessages = useCallback(async () => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    try {
      const convId = await ensureConversation();
      if (!convId) return;
      const msgs = await api.messaging.conversations.getMessages(token, convId);
      applyMessages(msgs);
      setError(null);
    } catch (err) {
      if (!conversationIdRef.current) {
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudo cargar el chat de la sesión",
        );
      }
    } finally {
      pollingRef.current = false;
    }
  }, [token, ensureConversation, applyMessages]);

  // Bootstrap una sola vez al montar
  useEffect(() => {
    let cancelled = false;
    setBooting(true);
    void (async () => {
      try {
        await fetchMessages();
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar / cambiar cita
  }, [appointmentId, token]);

  // Polling estable: no depende de applyMessages ni conversation
  useEffect(() => {
    const tick = () => {
      if (!openRef.current && document.visibilityState !== "visible") return;
      void fetchMessages();
    };

    const intervalMs = open ? POLL_OPEN_MS : POLL_BACKGROUND_MS;
    const id = window.setInterval(tick, intervalMs);

    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [open, fetchMessages]);

  useEffect(() => {
    if (!open) return;
    setLoadingOpen(true);
    requestNotificationPermission();
    void fetchMessages().finally(() => setLoadingOpen(false));
  }, [open, fetchMessages]);

  const signalTyping = useCallback(
    async (isTyping: boolean) => {
      const id = conversationIdRef.current;
      if (!id) return;
      await api.messaging.conversations.setTyping(token, id, { isTyping });
    },
    [token],
  );

  const fetchPeerTyping = useCallback(async () => {
    const id = conversationIdRef.current;
    if (!id) return false;
    try {
      const status = await api.messaging.conversations.getTyping(token, id);
      return Boolean(status?.peerTyping);
    } catch {
      return false;
    }
  }, [token]);

  const { peerTyping, onInputChange, stopTyping } = useChatTyping({
    enabled: open && Boolean(conversation) && !loadingOpen && !error,
    signalTyping,
    fetchPeerTyping,
  });

  useEffect(() => {
    if (!open) return;
    if (messages.length !== messageCountRef.current) {
      messageCountRef.current = messages.length;
      scrollToBottom();
    }
  }, [messages, open, scrollToBottom]);

  async function handleSend(content: string) {
    const id = conversationIdRef.current;
    if (!id) return;
    const msg = await api.messaging.conversations.sendMessage(token, id, {
      content,
    });
    setMessages((prev) => {
      const next = [...prev, msg];
      lastSeenIdRef.current = msg.id;
      return next;
    });
    setUnreadCount(0);
  }

  function handleOpen() {
    setOpen(true);
    setToast(null);
  }

  const typingLabel =
    ownSender === "PATIENT"
      ? "Tu profesional está escribiendo"
      : "El paciente está escribiendo";

  const showConnecting = (booting || loadingOpen) && messages.length === 0;

  const panelStyle = {
    width: `min(${PANEL_WIDTH_PX}px, calc(100vw - 2rem))`,
    height: `min(${PANEL_HEIGHT_PX}px, calc(100dvh - 7rem))`,
  } as const;

  return (
    <>
      {toast && !open ? (
        <button
          type="button"
          onClick={handleOpen}
          className="fixed bottom-36 right-4 z-[55] max-w-[min(100vw-2rem,18rem)] rounded-mu border border-mu-primary/30 bg-mu-surface px-3 py-2 text-left text-xs text-mu-text shadow-lg lg:bottom-28 lg:right-6"
        >
          <span className="font-medium text-mu-primary">{toast}</span>
          <span className="mt-0.5 block text-mu-text-muted">
            Toca para abrir el chat
          </span>
        </button>
      ) : null}

      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          className={cn(
            "fixed bottom-20 right-4 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-mu-primary text-white shadow-lg transition-transform hover:scale-105 lg:bottom-6 lg:right-6",
            unreadCount > 0 && "animate-pulse ring-2 ring-mu-primary/40",
          )}
          aria-label={
            unreadCount > 0
              ? `Abrir chat, ${unreadCount} mensajes nuevos`
              : "Abrir chat de la sesión"
          }
        >
          <MessageSquare className="h-6 w-6" aria-hidden />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-mu-error px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      ) : (
        <ChatPanelShell
          aria-label={title}
          className="fixed bottom-20 right-4 z-[55] shadow-xl lg:bottom-6 lg:right-6"
          style={panelStyle}
          header={
            <div className="flex items-center gap-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-mu-text">
                  {title}
                </h2>
                <p className="truncate text-xs text-mu-text-muted">{peerLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-mu p-1.5 text-mu-text-muted hover:bg-mu-accent hover:text-mu-text"
                aria-label="Minimizar chat"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          }
          footer={
            showConnecting ? null : (
              <div className="px-3 pb-2 pt-2">
                <div className="mb-2 flex h-8 items-center">
                  {peerTyping ? (
                    <TypingIndicator label={typingLabel} compact />
                  ) : null}
                </div>
                <ChatInput
                  onSend={handleSend}
                  onTypingChange={onInputChange}
                  onTypingStop={stopTyping}
                  disabled={Boolean(error) || !conversation}
                  placeholder="Escribe un mensaje…"
                  className="border-t-0 pt-0"
                />
              </div>
            )
          }
        >
          {showConnecting ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-mu-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Conectando…
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
              <p className="text-xs text-mu-error">{error}</p>
              <button
                type="button"
                className="rounded-mu border border-mu-border px-3 py-1.5 text-xs font-medium text-mu-text hover:bg-mu-accent"
                onClick={() => {
                  setError(null);
                  setLoadingOpen(true);
                  void fetchMessages().finally(() => setLoadingOpen(false));
                }}
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-2"
            >
              <ChatMessageList
                embedded
                messages={messages}
                ownSenders={[ownSender]}
                emptyLabel="Aún no hay mensajes en esta sesión."
                showTypingIndicator={false}
              />
            </div>
          )}
        </ChatPanelShell>
      )}
    </>
  );
}
