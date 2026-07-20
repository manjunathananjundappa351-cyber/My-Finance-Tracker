import { apiClient } from "@/api/axios";
import { DashboardSummary } from "@/types/dashboard";

export const dashboardApi = {
  getSummary: () =>
    apiClient.get<DashboardSummary>("/dashboard/summary").then((res) => res.data),
};
