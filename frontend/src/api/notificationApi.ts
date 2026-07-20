import { apiClient } from "@/api/axios";
import { AppNotification } from "@/types/notification";

export const notificationApi = {
  list: () => apiClient.get<AppNotification[]>("/notifications").then((res) => res.data),

  markRead: (id: number) =>
    apiClient.post<AppNotification>(`/notifications/${id}/read`).then((res) => res.data),

  markAllRead: () => apiClient.post("/notifications/read-all"),
};
