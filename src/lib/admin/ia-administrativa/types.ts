export type IaAlertType =
  | "sensitive_post"
  | "critical_message"
  | "poor_anonymization"
  | "pending_payment"
  | "unvalidated_psychologist";

export type IaAlertStatus =
  | "pending"
  | "reviewed"
  | "ignored"
  | "approved"
  | "escalated";

export interface IaStats {
  sensitivePosts: number;
  criticalMessages: number;
  poorAnonymization: number;
  pendingPayments: number;
  unvalidatedPsychologists: number;
}

export interface IaAlertListItem {
  id: string;
  type: IaAlertType;
  userName: string;
  reason: string;
  aiConfidence: number;
  status: IaAlertStatus;
  createdAt: string;
}

export interface IaAlertDetail extends IaAlertListItem {
  userId: string;
  aiAnalysis: string;
  suggestedAction: string;
  context: string;
}

export interface IaAdministrativaData {
  stats: IaStats;
  alerts: IaAlertListItem[];
}

export interface IaFilters {
  type?: IaAlertType | "all";
  status?: IaAlertStatus | "all";
  search?: string;
}

export type IaActionType = "review" | "ignore" | "approve" | "escalate";

export interface IaActionPayload {
  type: IaActionType;
  note?: string;
}
