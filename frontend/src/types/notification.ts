export type NotificationLevel = "info" | "warning" | "error";

export interface AppNotification {
  id: number;
  message: string;
  level: NotificationLevel;
  is_read: boolean;
  created_at: string;
}
