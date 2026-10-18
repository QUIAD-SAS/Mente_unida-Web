import { adminJson } from "@/lib/admin/api/admin-fetch";
import type { DashboardHomeData } from "./types";

export async function fetchDashboardHome(): Promise<DashboardHomeData> {
  return adminJson<DashboardHomeData>("/dashboard/home");
}
