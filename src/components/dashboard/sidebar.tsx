"use client";

import { UnavailableDialog } from "@/components/dashboard/unavailable-dialog";
import { cleanupPatientChatOnLogout } from "@/lib/chat/logout-chat";
import { useMessagingUnreadStore } from "@/lib/chat/messaging-unread-store";
import { useNotificationsStore } from "@/lib/notifications/notifications-store";
import { cn } from "@/lib/utils";
import {
  Bot,
  Calendar,
  CalendarPlus,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  UsersRound,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "@/components/dashboard/logout-button";

type Role = "patient" | "psychologist";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  available: boolean;
}

const NAV_PATIENT: NavItem[] = [
  { href: "/app/paciente", label: "Inicio", icon: Home, available: true },
  {
    href: "/app/book-session",
    label: "Agendar",
    icon: CalendarPlus,
    available: true,
  },
  {
    href: "/app/paciente/citas",
    label: "Citas",
    icon: Calendar,
    available: true,
  },
  {
    href: "/app/paciente/configuracion",
    label: "Configuración",
    icon: Settings,
    available: true,
  },
];

const NAV_PSYCHOLOGIST: NavItem[] = [
  {
    href: "/app/psicologo",
    label: "Resumen",
    icon: Home,
    available: true,
  },
  {
    href: "/app/psicologo/agenda",
    label: "Agenda",
    icon: Calendar,
    available: true,
  },
  {
    href: "/app/psicologo/pacientes",
    label: "Pacientes",
    icon: Users,
    available: true,
  },
  {
    href: "/app/psicologo/mensajes",
    label: "Mensajes",
    icon: MessageSquare,
    available: true,
  },
  {
    href: "/app/psicologo/consultorio",
    label: "Consultorio",
    icon: Video,
    available: true,
  },
  {
    href: "/app/psicologo/comunidad",
    label: "Comunidad",
    icon: UsersRound,
    available: true,
  },
  {
    href: "/app/psicologo/ia",
    label: "IA Clínica",
    icon: Bot,
    available: false,
  },
  {
    href: "/app/psicologo/supervisiones",
    label: "Supervisiones",
    icon: UsersRound,
    available: false,
  },
  {
    href: "/app/psicologo/configuracion",
    label: "Configuración",
    icon: Settings,
    available: true,
  },
];

function NavLink({
  item,
  active,
  className,
  onUnavailable,
  badge,
  badgeTitle,
}: {
  item: NavItem;
  active: boolean;
  className: string;
  onUnavailable: (label: string) => void;
  badge?: number;
  badgeTitle?: string;
}) {
  const content = (
    <>
      <span className="relative shrink-0">
        <item.icon className="h-5 w-5" aria-hidden />
        {badge && badge > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mu-error px-0.5 text-[9px] font-semibold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </span>
      <span className="flex-1">{item.label}</span>
    </>
  );

  if (!item.available) {
    return (
      <button
        type="button"
        onClick={() => onUnavailable(item.label)}
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      className={className}
      aria-current={active ? "page" : undefined}
      title={badge && badge > 0 ? badgeTitle : undefined}
    >
      {content}
    </Link>
  );
}

export function DashboardSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const clearSession = useAuthStore((s) => s.clearSession);
  const items = role === "patient" ? NAV_PATIENT : NAV_PSYCHOLOGIST;
  const psychologistUnread = useMessagingUnreadStore((s) => s.psychologistUnread);
  const supportUnread = useMessagingUnreadStore((s) => s.supportUnread);
  const appointmentUnread = useMessagingUnreadStore((s) => s.appointmentUnread);
  const appointmentNotificationUnread = useNotificationsStore(
    (s) => s.items.filter((n) => !n.readAt && n.type === "APPOINTMENT").length,
  );
  const messagingTitle =
    psychologistUnread > 0
      ? `${supportUnread} en escuchadero, ${appointmentUnread} en citas`
      : undefined;
  const [unavailableLabel, setUnavailableLabel] = useState<string | null>(null);

  async function handleMobileLogout() {
    await cleanupPatientChatOnLogout(token);
    clearSession();
    router.replace("/login");
  }

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-mu px-3 py-2.5 text-sm font-medium transition-colors w-full text-left",
      active
        ? "bg-mu-accent text-mu-primary"
        : "text-mu-text-muted hover:bg-mu-background hover:text-mu-text",
    );

  const mobileClass = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
      active ? "text-mu-primary" : "text-mu-text-muted",
    );

  return (
    <>
      <UnavailableDialog
        open={unavailableLabel !== null}
        label={unavailableLabel ?? ""}
        onClose={() => setUnavailableLabel(null)}
      />

      <aside
        className="hidden h-full w-64 shrink-0 flex-col overflow-hidden border-r border-mu-border bg-mu-surface lg:flex"
        aria-label="Navegación del panel"
      >
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-4">
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              className={linkClass(pathname === item.href)}
              onUnavailable={setUnavailableLabel}
              badge={
                role === "psychologist" &&
                item.href === "/app/psicologo/mensajes"
                  ? psychologistUnread
                  : (role === "psychologist" &&
                        item.href === "/app/psicologo/agenda") ||
                      (role === "patient" && item.href === "/app/paciente/citas")
                    ? appointmentNotificationUnread
                    : undefined
              }
              badgeTitle={
                item.href === "/app/psicologo/mensajes"
                  ? messagingTitle
                  : appointmentNotificationUnread > 0
                    ? `${appointmentNotificationUnread} notificaciones de citas`
                    : undefined
              }
            />
          ))}
        </nav>
        <div className="mt-auto border-t border-mu-border p-4 pt-6">
          <LogoutButton />
        </div>
      </aside>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-mu-border bg-mu-surface lg:hidden"
        aria-label="Navegación móvil del panel"
      >
        {items.slice(0, 4).map((item) => {
          const active = pathname === item.href;
          const badge =
            role === "psychologist" &&
            item.href === "/app/psicologo/mensajes"
              ? psychologistUnread
              : (role === "psychologist" &&
                    item.href === "/app/psicologo/agenda") ||
                  (role === "patient" && item.href === "/app/paciente/citas")
                ? appointmentNotificationUnread
                : 0;
          if (!item.available) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => setUnavailableLabel(item.label)}
                className={mobileClass(active)}
              >
                <item.icon className="h-5 w-5" aria-hidden />
                <span className="truncate px-1">{item.label}</span>
              </button>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={mobileClass(active)}
              aria-current={active ? "page" : undefined}
              title={badge > 0 ? messagingTitle : undefined}
            >
              <span className="relative">
                <item.icon className="h-5 w-5" aria-hidden />
                {badge > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-mu-error px-0.5 text-[8px] font-semibold text-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
              </span>
              <span className="truncate px-1">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleMobileLogout}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-mu-text-muted"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" aria-hidden />
          <span className="truncate px-1">Salir</span>
        </button>
      </nav>
    </>
  );
}
