import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../lib/api/dashboard-v2";

export const dashboardKey = ["dashboard"];

export function useDashboardV2() {
  return useQuery({
    queryKey: dashboardKey,
    queryFn: () => dashboardApi.get(),
  });
}
