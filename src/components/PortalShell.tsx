import { useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

type Item = { to: string; label: string; icon: string; end?: boolean };

const patientNav: Item[] = [
  { to: "/paciente", label: "Inicio", icon: "home", end: true },
  { to: "/paciente/citas", label: "Mis citas y calendario", icon: "calendar_month" },
  { to: "/paciente/agendar", label: "Agendar", icon: "event_available" },
  { to: "/paciente/escuchadero", label: "El Escuchadero", icon: "chat" },
  { to: "/paciente/sala", label: "Sesión virtual", icon: "videocam" },
];

const psychNav: Item[] = [
  { to: "/psicologo", label: "Inicio", icon: "home", end: true },
  { to: "/psicologo/agenda", label: "Agenda y mis citas", icon: "calendar_month" },
  { to: "/psicologo/pacientes", label: "Pacientes", icon: "group" },
  { to: "/psicologo/agendar", label: "Agendar sesión", icon: "event_available" },
  { to: "/psicologo/escuchadero", label: "El Escuchadero", icon: "chat" },
  { to: "/psicologo/sala", label: "Sesión virtual", icon: "videocam" },
];

export function PortalShell({
  role,
  person,
  detail,
  fillViewport = false,
  children,
}: {
  role: "patient" | "psychologist";
  person: string;
  detail: string;
  fillViewport?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const items = role === "patient" ? patientNav : psychNav;
  const home = role === "patient" ? "/paciente" : "/psicologo";
  const escuchadero = role === "patient" ? "/paciente/escuchadero" : "/psicologo/escuchadero";
  const hideFab = location.pathname.includes("/escuchadero") || location.pathname.includes("/sala");

  return (
    <div className={fillViewport ? "h-dvh overflow-hidden bg-surface text-ink" : "min-h-screen overflow-x-clip bg-surface text-ink"}>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col justify-between border-r border-surface-high bg-surface-low px-4 py-6 lg:flex">
        <div>
          <Logo size="sm" to={home} className="mb-8 px-2" />
          <SideNav items={items} onNavigate={() => setOpen(false)} />
        </div>
        <Profile person={person} detail={detail} />
      </aside>

      <div className={fillViewport ? "flex h-dvh min-h-0 flex-col lg:pl-72" : "lg:pl-72"}>
        <header className={`${fillViewport ? "" : "sticky top-0"} z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-surface-high bg-surface/90 px-4 backdrop-blur-xl sm:px-6`}>
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-ink lg:hidden"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name={open ? "close" : "menu"} className="text-[24px]" />
            </button>
            <Logo size="sm" to={home} className="lg:hidden" />
            <span className="hidden rounded-full bg-primary/10 px-3 py-1 font-display text-xs font-semibold text-primary sm:inline-flex">
              Entorno clínico seguro
            </span>
          </div>
          <NavLink
            to={escuchadero}
            className="inline-flex items-center gap-2 rounded-full bg-surface-mid px-3 py-2 font-display text-sm font-semibold text-primary"
            aria-label="El Escuchadero"
          >
            <Icon name="chat" className="text-[20px]" />
            <span className="hidden sm:inline">El Escuchadero</span>
          </NavLink>
        </header>
        <main
          className={
            fillViewport
              ? "mx-auto flex min-h-0 w-full max-w-[1100px] flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6"
              : "mx-auto w-full min-w-0 max-w-[1100px] overflow-x-clip px-4 py-6 sm:px-6 sm:py-8"
          }
        >
          {children}
        </main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-ink/40" aria-label="Cerrar menú" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[min(100%,20rem)] flex-col justify-between bg-surface-low px-4 py-6 shadow-xl">
            <div>
              <Logo size="sm" to={home} className="mb-8" />
              <SideNav items={items} onNavigate={() => setOpen(false)} />
            </div>
            <Profile person={person} detail={detail} />
          </div>
        </div>
      ) : null}

      {hideFab ? null : (
        <NavLink
          to={escuchadero}
          aria-label="El Escuchadero"
          className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-white shadow-lg sm:right-6 sm:bottom-6"
        >
          <Icon name="chat" className="text-[26px]" />
        </NavLink>
      )}
    </div>
  );
}

function SideNav({ items, onNavigate }: { items: Item[]; onNavigate: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Portal">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 font-display text-sm font-semibold ${
              isActive ? "bg-primary-container text-white" : "text-ink-soft hover:bg-surface-mid hover:text-ink"
            }`
          }
        >
          <Icon name={item.icon} className="text-[20px]" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function Profile({ person, detail }: { person: string; detail: string }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  return (
    <div className="rounded-xl bg-white p-3">
      <p className="font-display text-sm font-semibold">{person}</p>
      <p className="text-xs text-ink-soft">{detail}</p>
      <button
        type="button"
        disabled={pending}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-secondary disabled:opacity-60"
        onClick={() => {
          setPending(true);
          void logout().finally(() => navigate("/iniciar-sesion", { replace: true }));
        }}
      >
        <Icon name="logout" className="text-[18px]" />
        {pending ? "Saliendo…" : "Salir"}
      </button>
    </div>
  );
}
