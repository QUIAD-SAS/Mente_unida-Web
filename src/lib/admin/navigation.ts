import {
  Bot,
  ClipboardList,
  FileCheck,
  Globe,
  Headphones,
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  ListChecks,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const DASHBOARD_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Escuchadero", href: "/dashboard/escuchadero", icon: MessageSquare },
  { label: "Emergencias", href: "/dashboard/escuchadero/emergencias", icon: AlertTriangle },
  { label: "Seguimiento", href: "/dashboard/escuchadero/seguimiento", icon: ListChecks },
  { label: "Soporte", href: "/dashboard/soporte", icon: Headphones },
  { label: "Usuarios", href: "/dashboard/usuarios", icon: Users },
  { label: "Solicitudes", href: "/dashboard/solicitudes", icon: ClipboardList },
  { label: "Comunidad", href: "/dashboard/comunidad", icon: Globe },
  { label: "Moderación", href: "/dashboard/moderacion", icon: ShieldCheck },
  { label: "Finanzas", href: "/dashboard/finanzas", icon: Wallet },
  { label: "IA Administrativa", href: "/dashboard/ia-administrativa", icon: Bot },
  { label: "Auditoría", href: "/dashboard/auditoria", icon: FileCheck },
  { label: "Configuración", href: "/dashboard/configuracion", icon: Settings },
];

const USUARIOS_PATHS = [
  "/dashboard/usuarios",
  "/dashboard/pacientes",
  "/dashboard/psicologos",
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (href === "/dashboard/usuarios") {
    return USUARIOS_PATHS.some((p) => pathname.startsWith(p));
  }
  return pathname.startsWith(href);
}
