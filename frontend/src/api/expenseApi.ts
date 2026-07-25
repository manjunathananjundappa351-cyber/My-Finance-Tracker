import { apiClient } from "@/api/axios";
import {
  Expense,
  ExpenseBulkImportResult,
  ExpenseCategory,
  ExpenseCreatePayload,
  ExpenseImportItem,
} from "@/types/expense";

export interface ExpenseFilters {
  start_date?: string;
  end_date?: string;
  category_id?: number;
  tag_id?: number;
  include_archived?: boolean;
  archived_only?: boolean;
}

export const expenseApi = {
  listCategories: () =>
    apiClient.get<ExpenseCategory[]>("/expenses/categories").then((res) => res.data),

  createCategory: (name: string, type: "need" | "want") =>
    apiClient
      .post<ExpenseCategory>("/expenses/categories", { name, type })
      .then((res) => res.data),

  list: (filters: ExpenseFilters = {}) =>
    apiClient.get<Expense[]>("/expenses", { params: filters }).then((res) => res.data),

  create: (payload: ExpenseCreatePayload) =>
    apiClient.post<Expense>("/expenses", payload).then((res) => res.data),

  update: (id: number, payload: Partial<ExpenseCreatePayload>) =>
    apiClient.put<Expense>(`/expenses/${id}`, payload).then((res) => res.data),

  archive: (id: number) =>
    apiClient.post<Expense>(`/expenses/${id}/archive`).then((res) => res.data),

  restore: (id: number) =>
    apiClient.post<Expense>(`/expenses/${id}/restore`).then((res) => res.data),

  bulkArchive: (ids: number[]) => apiClient.post("/expenses/bulk/archive", { ids }),
  bulkRestore: (ids: number[]) => apiClient.post("/expenses/bulk/restore", { ids }),
  bulkDelete: (ids: number[]) => apiClient.post("/expenses/bulk/delete", { ids }),
  bulkImport: (items: ExpenseImportItem[]) =>
    apiClient
      .post<ExpenseBulkImportResult>("/expenses/bulk/import", { items })
      .then((res) => res.data),

  remove: (id: number) => apiClient.delete(`/expenses/${id}`),
};
