import { apiClient } from "@/api/axios";
import { Goal, GoalCreatePayload } from "@/types/goal";

export const goalApi = {
  list: (params: { include_archived?: boolean; archived_only?: boolean } = {}) =>
    apiClient.get<Goal[]>("/goals", { params }).then((res) => res.data),

  create: (payload: GoalCreatePayload) =>
    apiClient.post<Goal>("/goals", payload).then((res) => res.data),

  update: (id: number, payload: Partial<GoalCreatePayload>) =>
    apiClient.put<Goal>(`/goals/${id}`, payload).then((res) => res.data),

  archive: (id: number) => apiClient.post<Goal>(`/goals/${id}/archive`).then((res) => res.data),
  restore: (id: number) => apiClient.post<Goal>(`/goals/${id}/restore`).then((res) => res.data),

  remove: (id: number) => apiClient.delete(`/goals/${id}`),
};
