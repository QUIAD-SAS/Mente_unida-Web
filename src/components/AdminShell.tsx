import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { fetchNotifications, markNotificationRead, type AppNotification } from "../api/admin";
import { apiErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { when } from "../pages/admin/format";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

export function AdminLayout() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}

const items = [
  { to: "/admin", label: "Dashboard / General", icon: "dashboard", end: true },
  { to: "/admin/validacion", label: "Validación de psicólogos", icon: "verified_user" },
  { to: "/admin/usuarios", label: "Gestión de usuarios y pacientes", icon: "group" },
  { to: "/admin/comunidad", label: "Moderación de comunidad y foros", icon: "chat" },
  { to: "/admin/metricas", label: "Métricas y auditoría clínica", icon: "monitoring" },
  { to: "/admin/configuracion", label: "Configuración de plataforma", icon: "settings" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [pending, setPending] = useState(false);
  const [notices, setNotices] = useState<AppNotification[]>([]);
  const [noticeError, setNoticeError] = useState("");
  const name = user?.name || "Administración";
  const unread = notices.filter((item) => item.state === "UNREAD").length;

  useEffect(() => {
    let alive = true;
    void fetchNotifications("ALL").then(
      (data) => {
        if (alive) setNotices(data.items);
      },
      (error: unknown) => {
        if (alive) setNoticeError(apiErrorMessage(error, "No se pudieron leer las notificaciones."));
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  function openNotice(item: AppNotification) {
    if (item.state === "READ") return;
    void markNotificationRead(item.id)
      .then((saved) => {
        setNotices((current) => current.map((notice) => (notice.id === saved.id ? saved : notice)));
      })
      .catch((error: unknown) => setNoticeError(apiErrorMessage(error, "No se pudo marcar la notificación.")));
  }
  const initials = name
    .split(" ")
    .filter((part) => part.length > 2)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen overflow-x-clip bg-surface text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col justify-between border-r border-surface-high bg-surface-low px-4 py-6 lg:flex">
        <div>
          <Logo size="sm" to="/admin" className="mb-8 px-2" />
          <AdminNav onNavigate={() => setOpen(false)} />
        </div>
        <Profile
          name={name}
          pending={pending}
          onLogout={() => {
            setPending(true);
            void logout().finally(() => navigate("/iniciar-sesion", { replace: true }));
          }}
        />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-surface-high bg-surface/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className="rounded-lg p-2 text-ink lg:hidden" aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen((value) => !value)}>
              <Icon name={open ? "close" : "menu"} className="text-[24px]" />
            </button>
            <Logo size="sm" to="/admin" className="lg:hidden" />
            <span className="hidden items-center gap-1.5 font-display text-sm font-semibold text-primary sm:inline-flex">
              <Icon name="verified_user" className="text-[18px]" />
              Portal clínico administrativo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button type="button" className="relative rounded-full p-2 text-ink" aria-label="Avisos" aria-expanded={alerts} onClick={() => setAlerts((value) => !value)}>
                <Icon name="notifications" className="text-[22px]" />
                {unread > 0 ? <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-secondary" /> : null}
              </button>
              {alerts ? (
                <div className="absolute right-0 z-40 mt-2 w-[min(20rem,80vw)] rounded-2xl bg-white p-3 shadow-lg">
                  {noticeError ? <p className="px-2 py-2 text-sm text-secondary">{noticeError}</p> : null}
                  {!noticeError && notices.length === 0 ? <p className="px-2 py-2 text-sm text-ink-soft">No hay notificaciones en esta cuenta.</p> : null}
                  {notices.map((item) => (
                    <button key={item.id} type="button" className="block w-full border-b border-surface-high px-2 py-2 text-left text-sm last:border-0" onClick={() => openNotice(item)}>
                      {item.title}
                      <span className="mt-0.5 block text-xs text-ink-soft">{when(item.createdAt)}{item.state === "UNREAD" ? " · sin leer" : ""}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-mid font-display text-xs font-semibold text-primary">{initials || "AR"}</span>
          </div>
        </header>
        <main className="mx-auto w-full min-w-0 max-w-[1180px] overflow-x-clip px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-ink/40" aria-label="Cerrar menú" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[min(100%,20rem)] flex-col justify-between overflow-y-auto bg-surface-low px-4 py-6 shadow-xl">
            <div>
              <Logo size="sm" to="/admin" className="mb-8" />
              <AdminNav onNavigate={() => setOpen(false)} />
            </div>
            <Profile
              name={name}
              pending={pending}
              onLogout={() => {
                setPending(true);
                void logout().finally(() => navigate("/iniciar-sesion", { replace: true }));
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminNav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Administración">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-left font-display text-sm leading-5 font-semibold ${
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

function Profile({ name, pending, onLogout }: { name: string; pending: boolean; onLogout: () => void }) {
  return (
    <div className="mt-6 rounded-xl bg-white p-3">
      <p className="font-display text-sm font-semibold">{name}</p>
      <p className="text-xs text-ink-soft">Contexto administrador</p>
      <button type="button" disabled={pending} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-secondary disabled:opacity-60" onClick={onLogout}>
        <Icon name="logout" className="text-[18px]" />
        {pending ? "Saliendo…" : "Salir"}
      </button>
    </div>
  );
}
