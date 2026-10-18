export type ConfigSection =
  | "plans"
  | "commissions"
  | "roles"
  | "permissions"
  | "emails"
  | "templates"
  | "ia"
  | "notifications";

export type PlanType = "comunidad" | "profesional" | "supervisor";

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: number;
  currency: string;
  benefits: string[];
  critical: boolean;
}

export interface CommissionConfig {
  platformRate: number;
  supervisorRate: number;
  critical: boolean;
}

export interface RoleConfig {
  id: string;
  name: string;
  description: string;
  critical: boolean;
}

export interface ConfigData {
  plans: PlanConfig[];
  commissions: CommissionConfig;
  roles: RoleConfig[];
}

export interface UpdatePlanPayload {
  section: "plans";
  planId: PlanType;
  price?: number;
  benefits?: string[];
}

export interface UpdateCommissionPayload {
  section: "commissions";
  platformRate?: number;
  supervisorRate?: number;
}

export type ConfigUpdatePayload = UpdatePlanPayload | UpdateCommissionPayload;
