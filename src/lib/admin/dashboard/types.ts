export interface DashboardStats {
  activeUsers: number;
  verifiedPsychologists: number;
  pendingRequests: number;
  escuchaderoMessages: number;
  supportTickets: number;
  aiAlerts: number;
  monthlyRevenue: number;
}

export interface WeeklyActivityPoint {
  day: string;
  registrations: number;
  subscriptions: number;
  appointments: number;
  revenue: number;
}

export type PatientStatus = "active" | "inactive" | "pending";

export interface RecentPatient {
  id: string;
  alias: string;
  email: string;
  status: PatientStatus;
  createdAt: string;
}

export type RequestStatus = "pending" | "approved" | "rejected" | "review";

export interface RecentRequest {
  id: string;
  psychologistName: string;
  status: RequestStatus;
  createdAt: string;
}

export type AlertType =
  | "reported_posts"
  | "critical_messages"
  | "pending_payments"
  | "pending_psychologists";

export interface DashboardAlert {
  id: string;
  type: AlertType;
  title: string;
  count: number;
  href: string;
}

export interface DashboardHomeData {
  stats: DashboardStats;
  weeklyActivity: WeeklyActivityPoint[];
  recentPatients: RecentPatient[];
  recentRequests: RecentRequest[];
  alerts: DashboardAlert[];
}
