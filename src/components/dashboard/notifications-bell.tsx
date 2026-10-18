"use client";

import { Button } from "@/components/ui/button";
import { useNotificationsStore } from "@/lib/notifications/notifications-store";
import { useAuthStore } from "@/lib/auth/store";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { Bell, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

function notificationHref(
  role: "patient" | "psychologist",
  type: string,
): string {
  if (type === "APPOINTMENT") {
    return role === "patient" ? "/app/paciente/citas" : "/app/psicologo/agenda";
  }
  return role === "patient" ? "/app/paciente" : "/app/psicologo";
}

export function NotificationsBell({
  role,
}: {
  role: "patient" | "psychologist";
}) {
  const token = useAuthStore((s) => s.token)!;
  const items = useNotificationsStore((s) => s.items);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [items],
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-mu-border bg-white text-mu-text-muted hover:bg-mu-accent hover:text-mu-text"
          aria-label={
            unreadCount > 0
              ? `Notificaciones, ${unreadCount} sin leer`
              : "Notificaciones"
          }
        >
          <Bell className="h-5 w-5" aria-hidden />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mu-error px-0.5 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed right-4 top-4 z-50 flex max-h-[min(80vh,32rem)] w-[min(100vw-2rem,24rem)] flex-col rounded-2xl border border-mu-border bg-white shadow-xl sm:right-8 sm:top-8">
          <div className="flex items-center justify-between border-b border-mu-border px-4 py-3">
            <Dialog.Title className="font-heading text-base font-semibold text-mu-text">
              Notificaciones
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void markAllRead(token)}
                >
                  Marcar leídas
                </Button>
              ) : null}
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mu-text-muted hover:bg-mu-accent"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto p-2">
            {sorted.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-mu-text-muted">
                No tienes notificaciones.
              </li>
            ) : (
              sorted.map((item) => (
                <li key={item.id}>
                  <Link
                    href={notificationHref(role, item.type)}
                    onClick={() => {
                      if (!item.readAt) void markRead(token, item.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "block rounded-xl px-3 py-3 transition-colors hover:bg-mu-accent",
                      !item.readAt && "bg-mu-accent/60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-mu-text">
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-mu-text-muted">
                        {formatRelative(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-mu-text-muted">{item.body}</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
