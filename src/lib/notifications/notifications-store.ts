"use client";

import { create } from "zustand";
import { api } from "@/lib/api-client";
import type { NotificationItem } from "@/lib/api/types";

interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  setItems: (items: NotificationItem[]) => void;
  refresh: (token: string) => Promise<void>;
  markRead: (token: string, id: string) => Promise<void>;
  markAllRead: (token: string) => Promise<void>;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  setItems: (items) =>
    set({
      items,
      unreadCount: items.filter((n) => !n.readAt).length,
    }),
  refresh: async (token) => {
    set({ loading: true });
    try {
      const items = await api.notifications.list(token);
      get().setItems(items);
    } finally {
      set({ loading: false });
    }
  },
  markRead: async (token, id) => {
    await api.notifications.markRead(token, id);
    const items = get().items.map((n) =>
      n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
    );
    get().setItems(items);
  },
  markAllRead: async (token) => {
    await api.notifications.markAllRead(token);
    const items = get().items.map((n) => ({
      ...n,
      readAt: n.readAt ?? new Date().toISOString(),
    }));
    get().setItems(items);
  },
  reset: () => set({ items: [], unreadCount: 0, loading: false }),
}));
