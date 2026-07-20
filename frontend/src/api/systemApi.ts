import { apiClient } from "@/api/axios";
import { ApplicationHealth } from "@/types/system";

export const systemApi = {
  health: () => apiClient.get<ApplicationHealth>("/system/health").then((res) => res.data),
};
