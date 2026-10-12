export interface AuditLog {
  id: string;
  event_type: string;
  message: string;
  actor_user_id?: string | null;
  outcome?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditEventPage {
  items: AuditLog[];
  skip: number;
  limit: number;
  has_more: boolean;
}
