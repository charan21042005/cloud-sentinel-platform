import { SentinelRole, AppPermission } from '../types';

export const PERMISSION_MATRIX: Record<SentinelRole, AppPermission[]> = {
  admin: [
    'incident:view', 'incident:create', 'incident:update_status', 'incident:assign', 'incident:delete',
    'metrics:view', 'alert:view', 'alert:acknowledge',
    'settings:view', 'users:manage', 'audit:view'
  ],
  analyst: [
    'incident:view', 'incident:create', 'incident:update_status', 'incident:assign',
    'metrics:view', 'alert:view', 'alert:acknowledge', 'audit:view'
  ],
  viewer: [
    'incident:view', 'metrics:view', 'alert:view', 'audit:view'
  ]
};
