"use client";

import { TypingIndicator } from "@/components/chat/typing-indicator";
import type { ChatMessage, ChatMessageSender } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

interface ChatMessageListProps {
  messages: ChatMessage[];
  ownSenders?: ChatMessageSender[];
  emptyLabel?: string;
  className?: string;
  peerTyping?: boolean;
  typingLabel?: string;
  compactTyping?: boolean;
  showTypingIndicator?: boolean;
  /** Solo burbujas; el scroll lo maneja el contenedor padre. */
  embedded?: boolean;
}

const DEFAULT_OWN: ChatMessageSender[] = ["PATIENT"];

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function MessageBubbles({
  messages,
  ownSenders,
  emptyLabel,
  showEmpty,
}: {
  messages: ChatMessage[];
  ownSenders: ChatMessageSender[];
  emptyLabel: string;
  showEmpty: boolean;
}) {
  if (showEmpty) {
    return (
      <p className="py-8 text-center text-sm text-mu-text-muted">{emptyLabel}</p>
    );
  }

  return (
    <>
      {messages.map((msg) => {
        const isOwn = ownSenders.includes(msg.sender);
        const isAi = msg.sender === "AI";
        const isSystem = msg.sender === "SYSTEM";

        if (isSystem) {
          return (
            <p
              key={msg.id}
              className="text-center text-xs text-mu-text-muted"
            >
              {msg.content}
            </p>
          );
        }

        return (
          <div
            key={msg.id}
            className={cn(
              "flex max-w-[85%] flex-col gap-0.5",
              isOwn ? "ml-auto items-end" : "items-start",
            )}
          >
            {isAi ? (
              <span className="flex items-center gap-1 text-xs text-mu-text-muted">
                <Bot className="h-3 w-3" aria-hidden />
                Asistente IA
              </span>
            ) : null}
            <div
              className={cn(
                "rounded-mu px-3 py-2 text-sm leading-relaxed",
                isAi &&
                  "border border-dashed border-mu-border bg-mu-background",
                isOwn && !isAi && "bg-mu-primary text-white",
                !isOwn && !isAi && "bg-mu-accent text-mu-text",
              )}
            >
              {msg.content}
            </div>
            <time
              className="text-[10px] text-mu-text-muted"
              dateTime={msg.createdAt}
            >
              {formatTime(msg.createdAt)}
            </time>
          </div>
        );
      })}
    </>
  );
}

function ChatMessageListScrollable({
  className,
  scrollDeps,
  children,
}: {
  className?: string;
  scrollDeps: unknown[];
  children: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, scrollDeps);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex flex-col gap-2 overflow-x-hidden overflow-y-auto overscroll-contain",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ChatMessageList({
  messages,
  ownSenders = DEFAULT_OWN,
  emptyLabel = "Aún no hay mensajes.",
  className,
  peerTyping = false,
  typingLabel,
  compactTyping = false,
  showTypingIndicator = true,
  embedded = false,
}: ChatMessageListProps) {
  const showEmpty = messages.length === 0 && !peerTyping;

  const content = (
    <>
      <MessageBubbles
        messages={messages}
        ownSenders={ownSenders}
        emptyLabel={emptyLabel}
        showEmpty={showEmpty}
      />
      {showTypingIndicator && peerTyping ? (
        <TypingIndicator
          label={typingLabel}
          compact={compactTyping}
          className="shrink-0 items-start"
        />
      ) : null}
    </>
  );

  if (embedded) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>{content}</div>
    );
  }

  return (
    <ChatMessageListScrollable
      className={className}
      scrollDeps={[messages, peerTyping]}
    >
      {content}
    </ChatMessageListScrollable>
  );
}
