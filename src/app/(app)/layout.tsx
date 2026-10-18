"use client";

import { AccountLink } from "@/components/dashboard/account-link";
import { NotificationsBell } from "@/components/dashboard/notifications-bell";
import { NotificationsPoller } from "@/components/dashboard/notifications-poller";
import { PatientChatProvider } from "@/components/chat/patient-chat-provider";
import { isPsychologistRole } from "@/lib/auth/display";
import { SessionProvider, useSession } from "@/lib/auth/session-context";
import Link from "next/link";

function AppHeaderActions() {
  const { session } = useSession();
  const role = isPsychologistRole(session?.roles) ? "psychologist" : "patient";

  return (
    <div className="flex items-center gap-3">
      {session ? <NotificationsBell role={role} /> : null}
      <AccountLink />
    </div>
  );
}

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-mu-background">
        <header className="z-30 shrink-0 border-b border-mu-border bg-mu-surface/95 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-4 lg:px-6">
            <Link
              href="/"
              className="font-heading text-lg font-bold text-mu-primary"
            >
              Mente Unida
            </Link>
            <AppHeaderActions />
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        <NotificationsPoller />
        <PatientChatProvider />
      </div>
    </SessionProvider>
  );
}
