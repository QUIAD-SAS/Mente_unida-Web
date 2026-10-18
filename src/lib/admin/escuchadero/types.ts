export type EscuchaderoStatus =
  | "pending"
  | "in_review"
  | "escalated"
  | "responded"
  | "closed";

export type EscuchaderoPriority = "low" | "medium" | "high" | "critical";

export interface EscuchaderoMessageListItem {
  id: string;
  alias: string;
  createdAt: string;
  updatedAt: string;
  subject: string;
  priority: EscuchaderoPriority;
  status: EscuchaderoStatus;
  assignedTo: string | null;
  unreadCount: number;
}

export interface EscuchaderoAttachment {
  id: string;
  name: string;
  url: string;
}

export interface EscuchaderoHistoryEntry {
  id: string;
  action: string;
  performedBy: string;
  createdAt: string;
  details?: string;
}

export interface EscuchaderoInternalNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface EscuchaderoThreadMessage {
  id: string;
  sender: "PATIENT" | "PSYCHOLOGIST" | "AI" | "SYSTEM";
  content: string;
  createdAt: string;
}

export interface EscuchaderoMessageDetail extends EscuchaderoMessageListItem {
  message: string;
  attachments: EscuchaderoAttachment[];
  history: EscuchaderoHistoryEntry[];
  internalNotes: EscuchaderoInternalNote[];
  thread: EscuchaderoThreadMessage[];
}

export interface EscuchaderoMessagesResponse {
  messages: EscuchaderoMessageListItem[];
  unreadTotal: number;
}

export interface EscuchaderoUnreadSummary {
  unreadTotal: number;
  conversationsWithUnread: number;
  recent: Array<{
    id: string;
    alias: string;
    subject: string;
    unreadCount: number;
    updatedAt: string;
  }>;
}

export type EscuchaderoActionType =
  | "respond"
  | "assign"
  | "escalate"
  | "close"
  | "add_note";

export interface EscuchaderoActionPayload {
  type: EscuchaderoActionType;
  content?: string;
  assignee?: string;
}

export interface EscuchaderoFilters {
  status?: EscuchaderoStatus | "all" | "active";
  priority?: EscuchaderoPriority | "all";
  search?: string;
}
