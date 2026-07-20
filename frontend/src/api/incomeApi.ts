import { apiClient } from "@/api/axios";
import { Income, IncomeCategory, IncomeCreatePayload } from "@/types/income";

export interface IncomeFilters {
  start_date?: string;
  end_date?: string;
  category_id?: number;
  tag_id?: number;
  include_archived?: boolean;
  archived_only?: boolean;
}

export const incomeApi = {
  listCategories: () =>
    apiClient.get<IncomeCategory[]>("/income/categories").then((res) => res.data),

  createCategory: (name: string) =>
    apiClient.post<IncomeCategory>("/income/categories", { name }).then((res) => res.data),

  list: (filters: IncomeFilters = {}) =>
    apiClient.get<Income[]>("/income", { params: filters }).then((res) => res.data),

  create: (payload: IncomeCreatePayload) =>
    apiClient.post<Income>("/income", payload).then((res) => res.data),

  update: (id: number, payload: Partial<IncomeCreatePayload>) =>
    apiClient.put<Income>(`/income/${id}`, payload).then((res) => res.data),

  archive: (id: number) =>
    apiClient.post<Income>(`/income/${id}/archive`).then((res) => res.data),

  restore: (id: number) =>
    apiClient.post<Income>(`/income/${id}/restore`).then((res) => res.data),

  bulkArchive: (ids: number[]) => apiClient.post("/income/bulk/archive", { ids }),
  bulkRestore: (ids: number[]) => apiClient.post("/income/bulk/restore", { ids }),
  bulkDelete: (ids: number[]) => apiClient.post("/income/bulk/delete", { ids }),

  remove: (id: number) => apiClient.delete(`/income/${id}`),
};
