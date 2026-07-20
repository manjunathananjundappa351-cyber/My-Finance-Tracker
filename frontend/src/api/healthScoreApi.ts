import { apiClient } from "@/api/axios";
import { FinancialHealthScore } from "@/types/healthScore";

export const healthScoreApi = {
  get: () => apiClient.get<FinancialHealthScore>("/health-score").then((res) => res.data),
};
