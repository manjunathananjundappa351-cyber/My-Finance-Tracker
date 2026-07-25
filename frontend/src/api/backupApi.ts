import { apiClient } from "@/api/axios";
import { BackupData, RestoreSummary } from "@/types/backup";

export const backupApi = {
  export: () => apiClient.get<BackupData>("/backup/export").then((res) => res.data),

  restore: (data: BackupData) =>
    apiClient.post<RestoreSummary>("/backup/restore", data).then((res) => res.data),
};
