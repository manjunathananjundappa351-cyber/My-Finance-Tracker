import { apiClient } from "@/api/axios";
import { AuditLogEntry } from "@/types/auditLog";

export const auditLogApi = {
  list: (limit = 100) =>
    apiClient
      .get<AuditLogEntry[]>("/activity", { params: { limit } })
      .then((res) => res.data),
};
