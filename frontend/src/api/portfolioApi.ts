import { apiClient } from "@/api/axios";
import {
  PortfolioHolding,
  PortfolioHoldingCreatePayload,
} from "@/types/portfolio";

export const portfolioApi = {
  list: (params: { include_archived?: boolean; archived_only?: boolean } = {}) =>
    apiClient.get<PortfolioHolding[]>("/portfolio/holdings", { params }).then((res) => res.data),

  create: (payload: PortfolioHoldingCreatePayload) =>
    apiClient
      .post<PortfolioHolding>("/portfolio/holdings", payload)
      .then((res) => res.data),

  update: (id: number, payload: Partial<PortfolioHoldingCreatePayload>) =>
    apiClient
      .put<PortfolioHolding>(`/portfolio/holdings/${id}`, payload)
      .then((res) => res.data),

  archive: (id: number) =>
    apiClient.post<PortfolioHolding>(`/portfolio/holdings/${id}/archive`).then((res) => res.data),

  restore: (id: number) =>
    apiClient.post<PortfolioHolding>(`/portfolio/holdings/${id}/restore`).then((res) => res.data),

  remove: (id: number) => apiClient.delete(`/portfolio/holdings/${id}`),
};
