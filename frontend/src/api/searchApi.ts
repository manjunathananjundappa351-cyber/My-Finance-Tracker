import { apiClient } from "@/api/axios";
import { SearchResponse } from "@/types/search";

export const searchApi = {
  search: (q: string) =>
    apiClient.get<SearchResponse>("/search", { params: { q } }).then((res) => res.data),
};
