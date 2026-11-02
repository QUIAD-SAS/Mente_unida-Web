import { api } from "./client";

export type VerificationStatus = "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type VerificationItem = {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  city: string | null;
  verificationStatus: VerificationStatus;
  createdAt: string;
  documentCount: number;
};

export type VerificationDocument = {
  id: string;
  type: string;
  fileName: string | null;
  status: string;
  reviewNotes: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
};

export type VerificationDetail = {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  title: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  department: string | null;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  createdAt: string;
  specialties: { code: string; name: string }[];
  workExperiences: {
    id: string;
    companyName: string;
    roleTitle: string;
    startDate: string;
    endDate: string | null;
  }[];
  documents: VerificationDocument[];
  decisions: { action: string; notes: string | null; actorId: string | null; at: string }[];
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  sentAt: string;
  readAt: string | null;
  state: "READ" | "UNREAD";
  deliveryStatus: string | null;
  reminderKind: string | null;
};

export type ClinicalIntegrity = {
  intact: boolean;
  checked: number;
  legacy: number;
};

export type ProcessHealth = {
  status: string;
  service: string;
  version: string;
  environment: string;
};

export type DatabaseHealth = {
  status: string;
  provider: string;
  latencyMs: number;
};

export type RedisHealth = {
  status: string;
  latencyMs?: number;
};

export type SupportReport = {
  id: string;
  status: string;
  category: string;
  conversationId: string;
  createdAt: string;
};

export type RiskAlert = {
  id: string;
  status: string;
  conversationId: string;
  createdAt: string;
};

export type CommunityReport = {
  id: string;
  status: string;
  category: string;
  postId: string;
  createdAt: string;
};

export type BillingPlan = {
  id: string;
  code: string;
  name: string;
  priceCents: number;
  currency: string;
  billingInterval: string;
  isActive: boolean;
};

export type AdminSubscription = {
  id: string;
  userId: string;
  status: string;
  paymentConfirmed: boolean;
  plan: { id: string; code: string; name: string } | null;
  priceCents: number;
  currency: string;
  currentPeriodEnd: string | null;
  createdAt: string;
};

export type ReminderRun = {
  planned: number;
  sent: number;
  failed: number;
  skipped: number;
  queue: string;
};

const page = { limit: 50 };

export function listVerifications(status?: VerificationStatus) {
  return api<{ items: VerificationItem[] }>("/admin/psychologists/verifications", {
    query: { status, limit: page.limit },
  });
}

export function fetchVerification(id: string) {
  return api<VerificationDetail>(`/admin/psychologists/verifications/${id}`);
}

export function approveVerification(id: string) {
  return api<VerificationDetail>(`/admin/psychologists/verifications/${id}/approve`, { method: "PATCH" });
}

export function rejectVerification(id: string, notes: string) {
  return api<VerificationDetail>(`/admin/psychologists/verifications/${id}/reject`, {
    method: "PATCH",
    body: { notes },
  });
}

export function requestVerificationChanges(id: string, notes: string, documentIds: string[]) {
  return api<VerificationDetail>(`/admin/psychologists/verifications/${id}/request-changes`, {
    method: "PATCH",
    body: { notes, ...(documentIds.length > 0 ? { documentIds } : {}) },
  });
}

export function fetchNotifications(state: "UNREAD" | "READ" | "ALL" = "ALL") {
  return api<{ items: AppNotification[] }>("/notifications", { query: { state } });
}

export function markNotificationRead(id: string) {
  return api<AppNotification>(`/notifications/${id}/read`, { method: "PATCH" });
}

export function fetchClinicalIntegrity() {
  return api<ClinicalIntegrity>("/admin/clinical-access");
}

export function fetchAdminDashboard() {
  return api<{ area: string; granted: boolean; accessContext: string }>("/admin/dashboard");
}

export function fetchProcessHealth() {
  return api<ProcessHealth>("/health", { auth: false });
}

export function fetchDatabaseHealth() {
  return api<DatabaseHealth>("/health/database", { auth: false });
}

export function fetchRedisHealth() {
  return api<RedisHealth>("/health/redis", { auth: false });
}

export function fetchSupportReports() {
  return api<{ items: SupportReport[] }>("/admin/support/reports");
}

export function fetchRiskAlerts() {
  return api<{ items: RiskAlert[] }>("/admin/support/risk-alerts");
}

export function fetchCommunityReports() {
  return api<{ items: CommunityReport[] }>("/admin/community/reports");
}

export function fetchAdminPlans() {
  return api<{ items: BillingPlan[] }>("/admin/plans");
}

export function fetchAdminSubscriptions() {
  return api<{ items: AdminSubscription[]; nextCursor: string | null }>("/admin/subscriptions", {
    query: { limit: 20 },
  });
}

export function runBillingReminders() {
  return api<ReminderRun>("/admin/reminders/run", { method: "POST", body: {} });
}
