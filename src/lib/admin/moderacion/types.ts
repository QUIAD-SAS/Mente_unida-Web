export type ModerationReason =
  | "spam"
  | "violence"
  | "advertising"
  | "incorrect_anonymization"
  | "offensive_language";

export type ModerationStatus = "pending" | "approved" | "hidden" | "removed";

export interface ModerationListItem {
  id: string;
  publicationId: string;
  publicationTitle: string;
  userName: string;
  reason: ModerationReason;
  aiFlagged: boolean;
  aiConfidence: number | null;
  status: ModerationStatus;
  createdAt: string;
}

export interface ModerationDetail extends ModerationListItem {
  publicationContent: string;
  userId: string;
  aiAnalysis: string | null;
  reportCount: number;
}

export interface ModerationResponse {
  items: ModerationListItem[];
}

export interface ModerationFilters {
  reason?: ModerationReason | "all";
  status?: ModerationStatus | "all";
  aiOnly?: boolean;
  search?: string;
}

export type ModerationActionType = "approve" | "delete" | "hide" | "warn";

export interface ModerationActionPayload {
  type: ModerationActionType;
  message?: string;
}
