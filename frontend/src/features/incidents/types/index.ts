export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type IncidentStatus = 'firing' | 'acknowledged' | 'resolved';

export interface IncidentEvent {
  id: string;
  incident_id: string;
  event_type: 'triggered' | 'acknowledged' | 'resolved' | 'escalated' | 'correlation_detected' | 'severity_changed';
  timestamp: string;
  actor: string;
  event_metadata?: Record<string, any> | null;
}

export interface Incident {
  id: string;
  fingerprint: string;
  title: string;
  description?: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  source: string;
  affected_service?: string | null;
  triggered_at: string;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
  labels?: Record<string, any> | null;
  annotations?: Record<string, any> | null;
  occurrence_count: number;
  event_count: number;
  last_seen_at: string;
  escalation_level: number;
  events?: IncidentEvent[] | null;
}

export interface IncidentFilters {
  status?: IncidentStatus | 'all';
  severity?: IncidentSeverity | 'all';
  search?: string;
  skip?: number;
  limit?: number;
}
