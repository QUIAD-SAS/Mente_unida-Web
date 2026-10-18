import { useQuery } from "@tanstack/react-query";
import { fetchDashboardHome } from "./api";

export const dashboardKeys = {
  home: ["dashboard", "home"] as const,
};

export function useDashboardHome() {
  return useQuery({
    queryKey: dashboardKeys.home,
    queryFn: fetchDashboardHome,
    staleTime: 60_000,
  });
}
