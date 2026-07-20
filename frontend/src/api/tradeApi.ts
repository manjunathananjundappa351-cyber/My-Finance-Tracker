import { apiClient } from "@/api/axios";
import { Trade, TradeAnalytics, TradeCreatePayload } from "@/types/trade";

export const tradeApi = {
  list: () => apiClient.get<Trade[]>("/trades").then((res) => res.data),

  analytics: () => apiClient.get<TradeAnalytics>("/trades/analytics").then((res) => res.data),

  create: (payload: TradeCreatePayload) =>
    apiClient.post<Trade>("/trades", payload).then((res) => res.data),

  update: (id: number, payload: Partial<TradeCreatePayload>) =>
    apiClient.put<Trade>(`/trades/${id}`, payload).then((res) => res.data),

  remove: (id: number) => apiClient.delete(`/trades/${id}`),
};
