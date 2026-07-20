import { apiClient } from "@/api/axios";
import { Loan, LoanCreatePayload } from "@/types/loan";

export const loanApi = {
  list: (params: { include_archived?: boolean; archived_only?: boolean } = {}) =>
    apiClient.get<Loan[]>("/loans", { params }).then((res) => res.data),

  create: (payload: LoanCreatePayload) =>
    apiClient.post<Loan>("/loans", payload).then((res) => res.data),

  update: (id: number, payload: Partial<LoanCreatePayload>) =>
    apiClient.put<Loan>(`/loans/${id}`, payload).then((res) => res.data),

  archive: (id: number) => apiClient.post<Loan>(`/loans/${id}/archive`).then((res) => res.data),
  restore: (id: number) => apiClient.post<Loan>(`/loans/${id}/restore`).then((res) => res.data),

  remove: (id: number) => apiClient.delete(`/loans/${id}`),
};
