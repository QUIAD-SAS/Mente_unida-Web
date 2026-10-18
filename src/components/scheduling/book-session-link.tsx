"use client";

import { Button } from "@/components/ui/button";
import type { DirectoryPsychologist } from "@/lib/api/types";
import { buildBookingUrl } from "@/lib/scheduling/directory-bridge";
import { useAuthStore } from "@/lib/auth/store";

interface BookSessionLinkProps {
  psychologist: DirectoryPsychologist;
  variant?: "primary" | "outline";
  className?: string;
}

export function BookSessionLink({
  psychologist,
  variant = "primary",
  className,
}: BookSessionLinkProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const bookingUrl = buildBookingUrl(psychologist.id);
  const loginUrl = `/login?next=${encodeURIComponent(bookingUrl)}`;

  return (
    <Button
      href={isAuthenticated ? bookingUrl : loginUrl}
      variant={variant === "outline" ? "outline" : "primary"}
      className={className}
    >
      Agendar sesión
    </Button>
  );
}
