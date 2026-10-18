"use client";

import { Button } from "@/components/admin/ui/button";
import { logout } from "@/lib/admin/auth/logout";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "sidebar";
  className?: string;
  icon?: React.ReactNode;
}

export function LogoutButton({
  variant = "default",
  className,
  icon,
}: LogoutButtonProps) {
  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={() => void logout()}
        className={cn("inline-flex items-center transition-colors", className)}
      >
        {icon}
        Cerrar sesión
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void logout()}
      className={className}
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </Button>
  );
}
