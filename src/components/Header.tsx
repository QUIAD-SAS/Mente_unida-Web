import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { navItems } from "../data/site";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const { status, user } = useAuth();
  const home = user?.accessContext === "PSYCHOLOGIST" ? "/psicologo" : "/paciente";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-transparent bg-surface/85 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 px-4 md:h-20 md:gap-6 md:px-12">
        <Logo size="sm" />
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Principal">
          {navItems.map((item) => (
            <Link
              key={item.hash}
              to={{ pathname: "/", hash: item.hash }}
              className="font-display text-sm font-semibold text-ink-soft transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {status === "authenticated" && user ? (
            <Link
              to={home}
              className="rounded-lg bg-primary-container px-3.5 py-1.5 font-display text-xs font-semibold tracking-wide text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary"
            >
              Mi espacio
            </Link>
          ) : (
            <>
              <Link
                to="/iniciar-sesion"
                className="rounded-lg px-3.5 py-1.5 font-display text-xs font-semibold tracking-wide text-primary transition hover:bg-surface-mid hover:text-ink"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="rounded-lg bg-primary-container px-3.5 py-1.5 font-display text-xs font-semibold tracking-wide text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary"
              >
                Registrarme
              </Link>
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <Link
            to="/registro"
            className="rounded-full bg-primary-container px-3 py-1.5 font-display text-xs font-semibold text-white md:hidden"
          >
            Registro
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-ink-soft transition hover:bg-surface-mid hover:text-ink"
            aria-label={open ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? "close" : "menu"} className="text-[24px]" />
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-surface-high bg-surface px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Móvil">
            {navItems.map((item) => (
              <Link
                key={item.hash}
                to={{ pathname: "/", hash: item.hash }}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-display text-sm font-semibold text-ink-soft hover:bg-surface-low hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={status === "authenticated" && user ? home : "/iniciar-sesion"}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg px-3 py-2.5 text-center font-display text-sm font-semibold text-primary hover:bg-surface-low"
            >
              {status === "authenticated" && user ? "Mi espacio" : "Iniciar sesión"}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
