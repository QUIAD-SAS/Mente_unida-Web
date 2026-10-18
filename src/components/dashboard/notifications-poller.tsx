"use client";

import { useNotificationsStore } from "@/lib/notifications/notifications-store";
import { useAuthStore } from "@/lib/auth/store";
import { useEffect } from "react";

const POLL_MS = 30_000;

/** Polling de notificaciones in-app para paciente y psicólogo. */
export function NotificationsPoller() {
  const token = useAuthStore((s) => s.token);
  const refresh = useNotificationsStore((s) => s.refresh);
  const reset = useNotificationsStore((s) => s.reset);

  useEffect(() => {
    if (!token) {
      reset();
      return;
    }

    void refresh(token);
    const id = window.setInterval(() => {
      void refresh(token);
    }, POLL_MS);

    return () => window.clearInterval(id);
  }, [token, refresh, reset]);

  return null;
}
