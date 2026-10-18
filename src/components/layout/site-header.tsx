"use client";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { getUserDisplayLabel, isPsychologistRole } from "@/lib/auth/display";
import { useSession } from "@/lib/auth/session-context";
import { getDashboardPath, useAuthStore } from "@/lib/auth/store";
import { cn } from "@/lib/utils";
import { Menu, Shield, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/directorio", label: "Profesionales" },
  { href: "/#comunidad", label: "Comunidad" },
  { href: "/#planes", label: "Planes" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const { session } = useSession();
  const isAuthenticated = Boolean(token);
  const displayLabel = getUserDisplayLabel(session, user);
  const roles = session?.roles ?? user?.roles ?? [user?.role ?? "PATIENT"];
  const isPsych = isPsychologistRole(roles);
  const dashboardPath = getDashboardPath(roles);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-mu-border/60 bg-mu-surface/90 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-mu focus:bg-mu-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Ir al contenido principal
      </a>
      <div className="mu-container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-heading text-xl font-bold text-mu-primary"
          aria-label={`${BRAND.name} — Inicio`}
        >
          {BRAND.name}
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navegación principal"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-mu-text-muted transition-colors hover:text-mu-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {mounted && isAuthenticated ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mu-accent px-3 py-1 text-sm font-medium text-mu-primary">
                {isPsych ? (
                  <User className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Shield className="h-3.5 w-3.5" aria-hidden />
                )}
                {displayLabel}
              </span>
              <Button size="sm" href={dashboardPath}>
                Mi espacio
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" href="/login">
                Ingresar
              </Button>
              <Button size="sm" href="/registro">
                Crear cuenta
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-mu p-2 text-mu-text md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <nav
        id="mobile-nav"
        className={cn(
          "border-t border-mu-border bg-mu-surface md:hidden",
          open ? "block" : "hidden",
        )}
        aria-label="Navegación móvil"
      >
        <div className="mu-container flex flex-col gap-4 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-base font-medium text-mu-text"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            {mounted && isAuthenticated ? (
              <>
                <p className="inline-flex items-center gap-2 text-sm font-medium text-mu-primary">
                  {isPsych ? (
                    <User className="h-4 w-4" aria-hidden />
                  ) : (
                    <Shield className="h-4 w-4" aria-hidden />
                  )}
                  {displayLabel}
                </p>
                <Button href={dashboardPath}>Mi espacio</Button>
              </>
            ) : (
              <>
                <Button variant="outline" href="/login">
                  Ingresar
                </Button>
                <Button href="/registro">Crear cuenta</Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
