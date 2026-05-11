'use client';

import { useAuth } from '@/features/auth/context/AuthContext';

export type SentinelRole = 'admin' | 'analyst' | 'viewer';

const roleHierarchy: Record<SentinelRole, number> = {
  viewer: 1,
  analyst: 2,
  admin: 3,
};

export function useRole() {
  const { user } = useAuth();

  const hasRole = (requiredRole: SentinelRole): boolean => {
    if (!user) return false;
    
    const userLevel = roleHierarchy[user.role as SentinelRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole];
    
    // The user must have a role level greater than or equal to the required level
    return userLevel >= requiredLevel;
  };

  const isExactly = (role: SentinelRole): boolean => {
    return user?.role === role;
  };

  return {
    role: user?.role as SentinelRole | undefined,
    hasRole,
    isExactly,
    isAuthenticated: !!user,
  };
}
