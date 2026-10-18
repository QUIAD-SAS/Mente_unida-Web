"use client";

import { LogoutButton } from "@/components/admin/auth/logout-button";
import { useEscuchaderoUnreadSummary } from "@/lib/admin/escuchadero/queries";
import { DASHBOARD_NAV, isNavActive } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const pathname = usePathname();
  const unreadQuery = useEscuchaderoUnreadSummary();
  const escuchaderoUnread = unreadQuery.data?.unreadTotal ?? 0;

  return (
    <aside
      className={cn(
        "flex h-full w-[240px] shrink-0 flex-col bg-mu-sidebar text-white",
        className,
      )}
    >
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mu-primary"
          aria-hidden
        >
          <svg viewBox="0 0 32 32" className="h-5 w-5 text-white" fill="none">
            <path
              d="M16 6C11.03 6 7 10.03 7 15c0 2.2.9 4.18 2.35 5.62L16 26l6.65-5.38A7.96 7.96 0 0 0 25 15c0-4.97-4.03-9-9-9Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="14" r="2.5" fill="currentColor" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold">Mente Unida</p>
          <p className="truncate text-xs text-white/60">Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegación principal">
        <ul className="space-y-1">
          {DASHBOARD_NAV.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            const showBadge =
              item.href === "/dashboard/escuchadero" && escuchaderoUnread > 0;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {showBadge ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-mu-error px-1.5 text-[10px] font-semibold text-white">
                      {escuchaderoUnread > 9 ? "9+" : escuchaderoUnread}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <LogoutButton
          variant="sidebar"
          className="w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
          icon={<LogOut className="h-4 w-4" aria-hidden />}
        />
      </div>
    </aside>
  );
}
