"use client";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { Card } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api-client";
import type { ChatConversation, ChatMessage, ChatMessageSender } from "@/lib/api/types";
import { useAuthStore } from "@/lib/auth/store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function AppointmentChat({
  appointmentId,
  ownSender,
  className,
  messageListClassName,
  hideHeader = false,
}: {
  appointmentId: string;
  ownSender: ChatMessageSender;
  className?: string;
  messageListClassName?: string;
  hideHeader?: boolean;
}) {
  const token = useAuthStore((s) => s.token)!;
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const conv = await api.messaging.conversations.byAppointment(token, appointmentId);
        const items = await api.messaging.conversations.getMessages(token, conv.id);
        if (active) {
          setConversation(conv);
          setMessages(items);
        }
      } catch (err) {
        if (active) setError(err instanceof ApiError ? err.message : "No se pudo cargar el chat");
      }
    }
    void load();
    return () => { active = false; };
  }, [appointmentId, token]);

  async function send(content: string) {
    if (!conversation) return;
    const message = await api.messaging.conversations.sendMessage(token, conversation.id, { content });
    setMessages((current) => [...current, message]);
  }

  return (
    <Card className={cn("flex min-h-80 flex-col overflow-hidden", className)}>
      {!hideHeader ? (
        <header className="border-b border-mu-border px-4 py-3">
          <h3 className="font-medium">Chat de la sesión</h3>
        </header>
      ) : null}
      {error ? <p className="p-4 text-sm text-mu-error">{error}</p> : null}
      <div className="min-h-0 flex-1 px-4 pt-3">
        <ChatMessageList
          messages={messages}
          ownSenders={[ownSender]}
          className={cn("h-52", messageListClassName)}
        />
      </div>
      <div className="px-4 pb-3">
        <ChatInput onSend={send} disabled={!conversation} placeholder="Escribe un mensaje…" />
      </div>
    </Card>
  );
}
