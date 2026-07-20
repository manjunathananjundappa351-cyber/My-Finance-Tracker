import { apiClient } from "@/api/axios";
import { Budget, BudgetCreatePayload } from "@/types/budget";

export const budgetApi = {
  list: () => apiClient.get<Budget[]>("/budgets").then((res) => res.data),

  create: (payload: BudgetCreatePayload) =>
    apiClient.post<Budget>("/budgets", payload).then((res) => res.data),

  update: (id: number, monthly_limit: number) =>
    apiClient.put<Budget>(`/budgets/${id}`, { monthly_limit }).then((res) => res.data),

  remove: (id: number) => apiClient.delete(`/budgets/${id}`),
};
