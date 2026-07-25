export interface AuditLogEntry {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  summary: string;
  created_at: string;
}
