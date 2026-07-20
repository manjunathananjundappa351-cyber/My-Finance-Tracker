import { apiClient } from "@/api/axios";
import { Tag, TagCreatePayload } from "@/types/tag";

export const tagApi = {
  list: () => apiClient.get<Tag[]>("/tags").then((res) => res.data),

  create: (payload: TagCreatePayload) =>
    apiClient.post<Tag>("/tags", payload).then((res) => res.data),

  remove: (id: number) => apiClient.delete(`/tags/${id}`),
};
