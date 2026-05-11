'use client';

import { useAuth } from '@/features/auth/context/AuthContext';
import { SentinelRole, AppPermission } from '../types';
import { PERMISSION_MATRIX } from '../permissions/matrix';

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: AppPermission): boolean => {
    if (!user) return false;
    
    // Safety fallback: if role isn't in matrix, deny access
    const userRole = user.role as SentinelRole;
    const allowedPermissions = PERMISSION_MATRIX[userRole];
    
    if (!allowedPermissions) return false;

    return allowedPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: AppPermission[]): boolean => {
    return permissions.some(hasPermission);
  };

  const hasAllPermissions = (permissions: AppPermission[]): boolean => {
    return permissions.every(hasPermission);
  };

  return {
    role: user?.role as SentinelRole | undefined,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAuthenticated: !!user,
  };
}
