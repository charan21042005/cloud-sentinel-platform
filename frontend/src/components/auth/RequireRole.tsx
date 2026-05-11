'use client';

import React from 'react';
import { useRole, SentinelRole } from '@/hooks/useRole';
import { ShieldAlert } from 'lucide-react';

interface RequireRoleProps {
  children: React.ReactNode;
  role: SentinelRole;
  fallback?: 'hidden' | 'disabled' | 'alert';
}

export default function RequireRole({ children, role, fallback = 'hidden' }: RequireRoleProps) {
  const { hasRole } = useRole();

  if (hasRole(role)) {
    return <>{children}</>;
  }

  // Handle unauthorized states
  if (fallback === 'hidden') {
    return null;
  }

  if (fallback === 'disabled') {
    return (
      <div className="opacity-50 pointer-events-none cursor-not-allowed filter grayscale" aria-disabled="true">
        {children}
      </div>
    );
  }

  // 'alert' fallback for when the user actively tries to view a protected section
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center backdrop-blur-sm">
      <ShieldAlert className="h-8 w-8 text-red-500 mb-3" />
      <h3 className="text-sm font-bold text-red-500">Clearance Denied</h3>
      <p className="mt-1 text-xs text-red-400/80 max-w-[250px]">
        This operational sector requires level <span className="uppercase font-mono font-bold text-red-400">{role}</span> clearance or higher.
      </p>
    </div>
  );
}
