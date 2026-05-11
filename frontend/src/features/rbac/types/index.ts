export type SentinelRole = 'admin' | 'analyst' | 'viewer';

export type AppPermission =
  // Incidents
  | 'incident:view'
  | 'incident:create'
  | 'incident:update_status'
  | 'incident:assign'
  | 'incident:delete'
  // Metrics & Alerts
  | 'metrics:view'
  | 'alert:view'
  | 'alert:acknowledge'
  // Settings & Admin
  | 'settings:view'
  | 'users:manage'
  | 'audit:view';
