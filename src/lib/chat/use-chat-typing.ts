"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const POLL_MS = 3500;
const HEARTBEAT_MS = 3000;

interface UseChatTypingOptions {
  enabled: boolean;
  signalTyping: (isTyping: boolean) => Promise<void>;
  fetchPeerTyping: () => Promise<boolean>;
}

export function useChatTyping({
  enabled,
  signalTyping,
  fetchPeerTyping,
}: UseChatTypingOptions) {
  const [peerTyping, setPeerTyping] = useState(false);
  const lastSentRef = useRef<boolean | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const signalTypingRef = useRef(signalTyping);
  const fetchPeerTypingRef = useRef(fetchPeerTyping);
  signalTypingRef.current = signalTyping;
  fetchPeerTypingRef.current = fetchPeerTyping;

  const setTyping = useCallback((typing: boolean) => {
    if (lastSentRef.current === typing) return;
    lastSentRef.current = typing;
    void signalTypingRef.current(typing).catch(() => undefined);

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (typing) {
      heartbeatRef.current = setInterval(() => {
        void signalTypingRef.current(true).catch(() => undefined);
      }, HEARTBEAT_MS);
    }
  }, []);

  const stopTyping = useCallback(() => setTyping(false), [setTyping]);

  const onInputChange = useCallback(
    (text: string) => {
      setTyping(text.trim().length > 0);
    },
    [setTyping],
  );

  useEffect(() => {
    if (!enabled) {
      setPeerTyping(false);
      return;
    }
    return () => {
      stopTyping();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [enabled, stopTyping]);

  useEffect(() => {
    if (!enabled) return;

    const poll = () => {
      if (document.visibilityState !== "visible") return;
      void fetchPeerTypingRef
        .current()
        .then(setPeerTyping)
        .catch(() => setPeerTyping(false));
    };

    poll();
    const id = window.setInterval(poll, POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  return { peerTyping, onInputChange, stopTyping };
}
