import { SentinelRole, AppPermission } from '../types';

export const PERMISSION_MATRIX: Record<SentinelRole, AppPermission[]> = {
  admin: [
    'incident:view',
    'incident:update_status',
    'metrics:view',
    'users:manage',
    'incident:inject',
  ],
  operator: ['incident:view', 'incident:update_status', 'metrics:view'],
  viewer: ['incident:view', 'metrics:view'],
};
