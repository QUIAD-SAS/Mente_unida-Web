import { DashboardHomeView } from "@/components/admin/dashboard-home-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <DashboardHomeView />;
}
