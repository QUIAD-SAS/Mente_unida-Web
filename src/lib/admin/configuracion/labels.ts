import type { ConfigSection, PlanType } from "./types";
import {
  Bell,
  Bot,
  CreditCard,
  LayoutGrid,
  Mail,
  Shield,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export const CONFIG_SECTIONS: Array<{
  id: ConfigSection;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "plans", label: "Planes", icon: LayoutGrid },
  { id: "commissions", label: "Comisiones", icon: CreditCard },
  { id: "roles", label: "Roles", icon: Users },
  { id: "permissions", label: "Permisos", icon: ShieldCheck },
  { id: "emails", label: "Emails", icon: Mail },
  { id: "templates", label: "Plantillas", icon: Mail },
  { id: "ia", label: "IA", icon: Bot },
  { id: "notifications", label: "Notificaciones", icon: Bell },
];

export const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  comunidad: "Comunidad",
  profesional: "Profesional",
  supervisor: "Supervisor",
};

export const CRITICAL_CONFIG_NOTICE =
  "Las configuraciones críticas no pueden eliminarse. Solo se permiten ediciones controladas.";

export const ShieldIcon = Shield;
