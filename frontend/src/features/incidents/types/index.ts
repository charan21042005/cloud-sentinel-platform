export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type IncidentStatus = 'open' | 'investigating' | 'mitigated' | 'resolved' | 'closed';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  reporter_id: string;
  assignee_id?: string | null;
}

export interface IncidentFilters {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedIncidents {
  items: Incident[];
  total: number;
  page: number;
  size: number;
}
