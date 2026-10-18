export type FinanzasSection =
  | "plan"
  | "billing"
  | "income"
  | "commissions"
  | "payments"
  | "refunds"
  | "payment_methods"
  | "reports";

export type CommissionStatus = "paid" | "pending" | "failed";

export type RefundStatus = "pending" | "approved" | "rejected" | "processed";

export interface FinanzasStats {
  monthlyRevenue: number;
  activePsychologists: number;
  activePatients: number;
  cancellations: number;
}

export interface CommissionRow {
  id: string;
  psychologistName: string;
  plan: string;
  commission: number;
  income: number;
  status: CommissionStatus;
}

export interface RefundRow {
  id: string;
  alias: string;
  amount: number;
  reason: string;
  status: RefundStatus;
}

export interface FinanzasData {
  stats: FinanzasStats;
  commissions: CommissionRow[];
  refunds: RefundRow[];
}

export interface FinanzasFilters {
  dateFrom?: string;
  dateTo?: string;
}
