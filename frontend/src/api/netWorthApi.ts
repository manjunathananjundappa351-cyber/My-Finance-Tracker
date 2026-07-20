import { apiClient } from "@/api/axios";
import { NetWorthTimeline } from "@/types/netWorth";

export const netWorthApi = {
  timeline: (days = 180) =>
    apiClient
      .get<NetWorthTimeline>("/networth/timeline", { params: { days } })
      .then((res) => res.data),
};
