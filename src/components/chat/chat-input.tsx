"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  onTypingChange?: (text: string) => void;
  onTypingStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSend,
  onTypingChange,
  onTypingStop,
  disabled,
  placeholder = "Escribe un mensaje…",
  className,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    return () => onTypingStop?.();
  }, [onTypingStop]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text || sending || disabled) return;

    setSending(true);
    onTypingStop?.();
    try {
      await onSend(text);
      setValue("");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-end gap-2 border-t border-mu-border pt-3",
        className,
      )}
    >
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onTypingChange?.(e.target.value);
        }}
        onBlur={() => onTypingStop?.()}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSubmit(e);
          }
        }}
        rows={1}
        disabled={disabled || sending}
        placeholder={placeholder}
        className="max-h-24 min-h-[40px] flex-1 resize-none rounded-mu border border-mu-border px-3 py-2 text-sm focus:border-mu-primary focus:outline-none focus:ring-1 focus:ring-mu-primary disabled:opacity-50"
      />
      <Button
        type="submit"
        size="sm"
        disabled={!value.trim() || disabled || sending}
        aria-label="Enviar mensaje"
        className="shrink-0"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Send className="h-4 w-4" aria-hidden />
        )}
      </Button>
    </form>
  );
}
