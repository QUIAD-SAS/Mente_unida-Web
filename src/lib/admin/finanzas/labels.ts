import type { CommissionStatus, FinanzasSection, RefundStatus } from "./types";
import {
  BarChart3,
  CreditCard,
  FileText,
  LayoutGrid,
  RefreshCcw,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const FINANZAS_SECTIONS: Array<{
  id: FinanzasSection;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "plan", label: "Mi plan", icon: LayoutGrid },
  { id: "billing", label: "Facturación", icon: FileText },
  { id: "income", label: "Ingresos", icon: TrendingUp },
  { id: "commissions", label: "Comisiones", icon: Wallet },
  { id: "payments", label: "Pagos", icon: CreditCard },
  { id: "refunds", label: "Reembolsos", icon: RefreshCcw },
  { id: "payment_methods", label: "Métodos pago", icon: CreditCard },
  { id: "reports", label: "Reportes", icon: BarChart3 },
];

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  paid: "Pagado",
  pending: "Pendiente",
  failed: "Fallido",
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  processed: "Procesado",
};

export function commissionStatusVariant(
  status: CommissionStatus,
): "default" | "success" | "warning" | "danger" | "muted" {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    default:
      return "muted";
  }
}

export function refundStatusVariant(
  status: RefundStatus,
): "default" | "success" | "warning" | "danger" | "muted" {
  switch (status) {
    case "processed":
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "danger";
    default:
      return "muted";
  }
}
