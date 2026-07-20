export interface ApplicationHealth {
  status: string;
  database_connected: boolean;
  api_version: string;
  environment: string;
  database_size_bytes: number | null;
}
