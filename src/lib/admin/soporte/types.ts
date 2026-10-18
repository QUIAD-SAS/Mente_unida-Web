export type SoporteStatus =
  | "open"
  | "pending"
  | "resolved"
  | "escalated"
  | "closed";

export interface SoporteConversation {
  id: string;
  userAlias: string;
  subject: string;
  status: SoporteStatus;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isTicket: boolean;
}

export interface SoporteAttachment {
  id: string;
  name: string;
  url: string;
}

export interface SoporteChatMessage {
  id: string;
  sender: "user" | "agent" | "system";
  senderName: string;
  content: string;
  createdAt: string;
  attachments?: SoporteAttachment[];
}

export interface SoporteUserInfo {
  alias: string;
  email: string;
  role: string;
  registeredAt: string;
  totalTickets: number;
}

export interface SoporteHistoryEntry {
  id: string;
  action: string;
  performedBy: string;
  createdAt: string;
}

export interface SoporteConversationDetail {
  conversation: SoporteConversation;
  user: SoporteUserInfo;
  messages: SoporteChatMessage[];
  history: SoporteHistoryEntry[];
}

export interface SoporteConversationsResponse {
  conversations: SoporteConversation[];
}

export type SoporteActionType =
  | "create_ticket"
  | "escalate"
  | "close"
  | "view_history";

export interface SoporteActionPayload {
  type: SoporteActionType;
}

export interface SoporteSendMessagePayload {
  content: string;
  attachmentIds?: string[];
}

export interface SoporteFilters {
  status?: SoporteStatus | "all";
  search?: string;
}
