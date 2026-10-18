"use client";

import { cn } from "@/lib/utils";
import { cleanupPatientChatOnLogout } from "@/lib/chat/logout-chat";
import { useAuthStore } from "@/lib/auth/store";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await cleanupPatientChatOnLogout(token);
    clearSession();
    router.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        "flex w-full items-center gap-3 rounded-mu px-3 py-2.5 text-sm font-medium text-mu-text-muted transition-colors hover:bg-mu-background hover:text-mu-error disabled:opacity-50",
        className,
      )}
    >
      <LogOut className="h-5 w-5 shrink-0" aria-hidden />
      {loading ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
