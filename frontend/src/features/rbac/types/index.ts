export type SentinelRole = 'admin' | 'operator' | 'viewer';

export type AppPermission =
  | 'incident:view'
  | 'incident:update_status'
  | 'metrics:view'
  | 'users:manage'
  | 'incident:inject';
