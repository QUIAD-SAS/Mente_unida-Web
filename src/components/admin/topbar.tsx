"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { Input } from "@/components/admin/ui/input";
import { logout } from "@/lib/admin/auth/logout";
import { useEscuchaderoUnreadSummary } from "@/lib/admin/escuchadero/queries";
import { cn } from "@/lib/utils";
import { Bell, Menu, MessageCircle, Search, Settings, User } from "lucide-react";
import Link from "next/link";

interface TopbarProps {
  onMenuClick?: () => void;
  className?: string;
}

export function Topbar({ onMenuClick, className }: TopbarProps) {
  const unreadQuery = useEscuchaderoUnreadSummary();
  const unreadTotal = unreadQuery.data?.unreadTotal ?? 0;
  const recent = unreadQuery.data?.recent ?? [];

  return (
    <header
      className={cn(
        "flex h-20 shrink-0 items-center gap-4 border-b border-mu-border bg-white px-4 lg:px-6",
        className,
      )}
    >
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-mu-border text-mu-text transition-colors hover:bg-mu-accent lg:hidden"
        aria-label="Abrir menú de navegación"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mu-text-muted" />
        <Input
          type="search"
          placeholder="Buscar pacientes, psicólogos, solicitudes…"
          className="h-11 pl-10"
          aria-label="Buscar en el panel"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-mu-border text-mu-text transition-colors hover:bg-mu-accent"
              aria-label={
                unreadTotal > 0
                  ? `Notificaciones, ${unreadTotal} sin leer`
                  : "Notificaciones"
              }
            >
              <Bell className="h-4 w-4" />
              {unreadTotal > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-mu-error px-1 text-[10px] font-semibold text-white">
                  {unreadTotal > 9 ? "9+" : unreadTotal}
                </span>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificaciones</span>
              {unreadTotal > 0 ? (
                <span className="text-xs font-normal text-mu-primary">
                  {unreadTotal} sin leer
                </span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {recent.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-mu-text-muted">
                No hay mensajes nuevos en el escuchadero.
              </div>
            ) : (
              recent.map((item) => (
                <DropdownMenuItem key={item.id} asChild>
                  <Link
                    href="/dashboard/escuchadero"
                    className="cursor-pointer flex-col items-start gap-0.5 py-2.5"
                  >
                    <span className="flex w-full items-center gap-2">
                      <MessageCircle className="h-3.5 w-3.5 shrink-0 text-mu-primary" />
                      <span className="truncate text-sm font-medium">
                        {item.alias}
                      </span>
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-mu-primary px-1 text-[10px] font-semibold text-white">
                        {item.unreadCount}
                      </span>
                    </span>
                    <span className="line-clamp-2 pl-5 text-xs text-mu-text-muted">
                      {item.subject}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/escuchadero"
                className="cursor-pointer justify-center font-medium text-mu-primary"
              >
                Ir al escuchadero
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 rounded-xl border border-mu-border px-2 py-1.5 transition-colors hover:bg-mu-accent sm:px-3"
              aria-label="Menú de administrador"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mu-primary text-sm font-semibold text-white">
                SA
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium text-mu-text">
                  Super Admin
                </span>
                <span className="block text-xs text-mu-text-muted">
                  super_admin
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/configuracion" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/configuracion" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-mu-error focus:text-mu-error"
              onSelect={() => void logout()}
            >
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
