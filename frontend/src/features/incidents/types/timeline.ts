import { Incident } from './index';

export interface TimelineEvent {
  id: string;
  incident_id: string;
  user_id: string;
  action: string;
  note?: string;
  created_at: string;
}

export interface IncidentDetail extends Incident {
  timeline: TimelineEvent[];
}
