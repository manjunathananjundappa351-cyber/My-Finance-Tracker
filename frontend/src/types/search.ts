export interface SearchResult {
  type: string;
  id: number;
  title: string;
  subtitle: string;
  path: string;
}

export interface SearchResponse {
  results: SearchResult[];
}
