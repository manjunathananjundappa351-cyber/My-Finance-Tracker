import { apiClient } from "@/api/axios";
import { GamificationStats } from "@/types/gamification";

export const gamificationApi = {
  get: () => apiClient.get<GamificationStats>("/gamification").then((res) => res.data),
};
