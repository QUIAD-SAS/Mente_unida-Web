"use client";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatPanelShell } from "@/components/chat/chat-panel-shell";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { api, ApiError } from "@/lib/api-client";
import type { ChatMessage, SupportChatSession } from "@/lib/api/types";
import {
  countUnreadFromPeer,
  notifyNewMessage,
  requestNotificationPermission,
} from "@/lib/chat/messaging-notifications";
import { usePatientSupportChatStore } from "@/lib/chat/patient-support-store";
import { useChatTyping } from "@/lib/chat/use-chat-typing";
import { useAuthStore } from "@/lib/auth/store";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const POLL_OPEN_MS = 5000;
const POLL_BACKGROUND_MS = 30000;
const PEER_SENDERS: ChatMessage["sender"][] = ["PSYCHOLOGIST"];

const PANEL_HEIGHT_PX = 416;
const PANEL_WIDTH_PX = 352;

export function PatientSupportChatWidget() {
  const token = useAuthStore((s) => s.token);
  const open = usePatientSupportChatStore((s) => s.open);
  const unreadCount = usePatientSupportChatStore((s) => s.unreadCount);
  const setOpen = usePatientSupportChatStore((s) => s.setOpen);
  const minimize = usePatientSupportChatStore((s) => s.minimize);
  const setUnreadCount = usePatientSupportChatStore((s) => s.setUnreadCount);

  const [session, setSession] = useState<SupportChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSeenIdRef = useRef<string | null>(null);
  const openRef = useRef(open);
  const messageCountRef = useRef(0);
  openRef.current = open;

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  const applyMessages = useCallback(
    (msgs: ChatMessage[]) => {
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
        PEER_SENDERS,
      );

      if (unread > 0) {
        const latest = [...list]
          .reverse()
          .find((m) => PEER_SENDERS.includes(m.sender));
        setToast("Tienes un nuevo mensaje");
        notifyNewMessage(
          "Escuchadero",
          latest?.content?.slice(0, 80) ?? "Nuevo mensaje del equipo de escucha",
        );
        window.setTimeout(() => setToast(null), 5000);
      }

      setUnreadCount(unread);
      setMessages(list);
    },
    [setUnreadCount],
  );

  const loadChat = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const sess = await api.messaging.support.getSession(token);
      setSession(sess);
      const msgs = await api.messaging.support.getMessages(token);
      applyMessages(msgs);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No pudimos conectar con el escuchadero",
      );
    }
  }, [token, applyMessages]);

  useEffect(() => {
    if (!open || !token) return;
    setLoading(true);
    requestNotificationPermission();
    void loadChat().finally(() => setLoading(false));
  }, [open, token, loadChat]);

  useEffect(() => {
    if (!token) return;

    const poll = () => {
      if (!open && document.visibilityState !== "visible") return;
      void api.messaging.support
        .getMessages(token)
        .then(applyMessages)
        .catch(() => undefined);
    };

    poll();
    const intervalMs = open ? POLL_OPEN_MS : POLL_BACKGROUND_MS;
    const id = window.setInterval(poll, intervalMs);
    return () => window.clearInterval(id);
  }, [token, open, applyMessages]);

  const signalTyping = useCallback(
    async (isTyping: boolean) => {
      if (!token) return;
      await api.messaging.support.setTyping(token, { isTyping });
    },
    [token],
  );

  const fetchPeerTyping = useCallback(async () => {
    if (!token) return false;
    try {
      const status = await api.messaging.support.getTyping(token);
      return Boolean(status?.peerTyping);
    } catch {
      return false;
    }
  }, [token]);

  const { peerTyping, onInputChange, stopTyping } = useChatTyping({
    enabled: open && Boolean(token) && !loading && !error,
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
    if (!token) return;
    const msg = await api.messaging.support.sendMessage(token, { content });
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

  const typingLabel = "El equipo de escucha está escribiendo";

  const fab = (
    <>
      {toast && !open ? (
        <button
          type="button"
          onClick={handleOpen}
          className="fixed bottom-36 right-4 z-[60] max-w-[min(100vw-2rem,18rem)] rounded-mu border border-mu-primary/30 bg-mu-surface px-3 py-2 text-left text-xs text-mu-text shadow-lg lg:bottom-24"
        >
          <span className="font-medium text-mu-primary">{toast}</span>
          <span className="mt-0.5 block text-mu-text-muted">
            Toca para abrir el escuchadero
          </span>
        </button>
      ) : null}

      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          className={cn(
            "fixed bottom-20 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-mu-primary text-white shadow-lg transition-transform hover:scale-105 lg:bottom-6",
            unreadCount > 0 && "animate-pulse ring-2 ring-mu-primary/40",
          )}
          aria-label={
            unreadCount > 0
              ? `Abrir escuchadero, ${unreadCount} mensajes nuevos`
              : "Abrir escuchadero"
          }
        >
          <MessageCircle className="h-6 w-6" aria-hidden />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-mu-error px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      ) : null}
    </>
  );

  const panelStyle = {
    width: `min(${PANEL_WIDTH_PX}px, calc(100vw - 2rem))`,
    height: `min(${PANEL_HEIGHT_PX}px, calc(100dvh - 6.5rem))`,
  } as const;

  const panel = open ? (
    <ChatPanelShell
      aria-label="Escuchadero"
      className="fixed bottom-20 right-4 z-[60] lg:bottom-6"
      style={panelStyle}
      header={
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-mu-text">
              Escuchadero
            </h2>
            <p className="truncate text-xs text-mu-text-muted">
              Equipo de escucha · Mente Unida
            </p>
          </div>
          <button
            type="button"
            onClick={minimize}
            className="shrink-0 rounded-mu p-1.5 text-mu-text-muted hover:bg-mu-accent hover:text-mu-text"
            aria-label="Minimizar chat"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      }
      footer={
        loading ? null : (
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
              disabled={Boolean(error)}
              placeholder="Escribe aquí…"
              className="border-t-0 pt-0"
            />
            <p className="mt-2 text-center text-[10px] leading-tight text-mu-text-muted">
              Este chat no se guarda al cerrar sesión.
            </p>
          </div>
        )
      }
    >
      {loading ? (
        <div className="flex h-full items-center justify-center gap-2 text-sm text-mu-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Conectando…
        </div>
      ) : error ? (
        <div className="flex h-full items-center p-3 text-xs text-mu-error">
          {error}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-2"
        >
          <ChatMessageList
            embedded
            messages={messages}
            ownSenders={["PATIENT"]}
            emptyLabel="Cuéntanos cómo te sientes. El equipo de escucha te acompañará."
            showTypingIndicator={false}
          />
        </div>
      )}
    </ChatPanelShell>
  ) : null;

  if (!mounted) return null;

  return createPortal(
    <>
      {fab}
      {panel}
    </>,
    document.body,
  );
}
