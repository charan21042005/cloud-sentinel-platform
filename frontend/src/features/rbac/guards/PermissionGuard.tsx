'use client';

import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { AppPermission } from '../types';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: AppPermission;
  fallback?: 'hidden' | 'disabled' | 'alert';
  customFallback?: React.ReactNode;
}

export default function PermissionGuard({ 
  children, 
  permission, 
  fallback = 'hidden',
  customFallback
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  if (customFallback) return <>{customFallback}</>;

  if (fallback === 'hidden') return null;

  if (fallback === 'disabled') {
    return (
      <div className="opacity-40 pointer-events-none cursor-not-allowed filter grayscale" aria-disabled="true">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center backdrop-blur-sm animate-in fade-in zoom-in duration-300">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 mb-4">
        <ShieldAlert className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest">Unauthorized Access</h3>
      <p className="mt-2 text-xs text-red-400/80 max-w-[300px]">
        Your active Sentinel clearance does not contain the required <span className="font-mono text-white/90 bg-zinc-950 px-1 py-0.5 rounded">{permission}</span> capability.
      </p>
    </div>
  );
}
