"use client";

import { api } from "@/lib/api-client";
import type { ChatMessage } from "@/lib/api/types";
import { useMessagingUnreadStore } from "@/lib/chat/messaging-unread-store";
import { useSession } from "@/lib/auth/session-context";
import { isPsychologistRole } from "@/lib/auth/display";
import { useAuthStore } from "@/lib/auth/store";
import { useEffect, useRef } from "react";

const POLL_MS = 15000;

export function PsychologistMessagingNotifier() {
  const token = useAuthStore((s) => s.token);
  const { session, loading } = useSession();
  const setPsychologistUnread = useMessagingUnreadStore(
    (s) => s.setPsychologistUnread,
  );
  const prevUnreadRef = useRef(0);
  const prevSupportRef = useRef(0);
  const prevAppointmentRef = useRef(0);

  useEffect(() => {
    if (loading || !session || !token || !isPsychologistRole(session.roles)) {
      return;
    }

    async function poll() {
      if (document.visibilityState !== "visible") return;
      try {
        const [support, conversations] = await Promise.all([
          api.messaging.support.inbox(token!),
          api.messaging.conversations.list(token!),
        ]);
        const supportUnread = support.reduce(
          (sum, s) => sum + (s.unreadCount ?? 0),
          0,
        );
        const appointmentUnread = conversations.reduce(
          (sum, c) => sum + (c.unreadCount ?? 0),
          0,
        );
        const total = supportUnread + appointmentUnread;

        if (total > prevUnreadRef.current) {
          const channel =
            supportUnread > prevSupportRef.current
              ? "escuchadero"
              : appointmentUnread > prevAppointmentRef.current
                ? "citas"
                : "mensajes";
          notifyNewMessage(
            "Mensajes",
            `Tienes mensajes nuevos en ${channel}`,
          );
        }
        prevUnreadRef.current = total;
        prevSupportRef.current = supportUnread;
        prevAppointmentRef.current = appointmentUnread;
        setPsychologistUnread({
          total,
          support: supportUnread,
          appointment: appointmentUnread,
        });
      } catch {
        /* backend puede no estar listo */
      }
    }

    void poll();
    const id = window.setInterval(poll, POLL_MS);
    return () => window.clearInterval(id);
  }, [loading, session, token, setPsychologistUnread]);

  return null;
}

export function countUnreadFromPeer(
  messages: ChatMessage[],
  lastSeenId: string | null,
  peerSenders: ChatMessage["sender"][],
): number {
  if (messages.length === 0) return 0;

  const lastSeenIndex = lastSeenId
    ? messages.findIndex((m) => m.id === lastSeenId)
    : -1;

  const start = lastSeenIndex >= 0 ? lastSeenIndex + 1 : 0;
  return messages
    .slice(start)
    .filter((m) => peerSenders.includes(m.sender)).length;
}

export function notifyNewMessage(title: string, body: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  // Solo notificación del sistema si la pestaña no está enfocada
  if (document.visibilityState === "visible" && document.hasFocus()) {
    return;
  }
  try {
    new Notification(title, { body, tag: "mente-unida-chat" });
  } catch {
    /* ignorar */
  }
}

export function requestNotificationPermission() {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "default"
  ) {
    return;
  }
  void Notification.requestPermission();
}
