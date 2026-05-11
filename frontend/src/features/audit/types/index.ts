export type AuditEventType = 'auth' | 'incident' | 'system' | 'rbac';

export interface AuditLog {
  id: string;
  event_type: AuditEventType;
  actor: string; // The user or system that performed the action
  action: string;
  target?: string; // e.g., 'Incident-001'
  timestamp: string;
  metadata?: Record<string, any>;
}
