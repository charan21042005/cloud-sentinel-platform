import React from 'react';
import { AuditLog } from '../types';
import { ShieldCheck, User, AlertCircle, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simulated Live Audit Data
const mockAuditLogs: AuditLog[] = [
  {
    id: 'aud-001',
    event_type: 'rbac',
    actor: 'System Admin',
    action: 'IAM Permission Policy Updated',
    target: 'Production Node Cluster 01',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'aud-002',
    event_type: 'incident',
    actor: 'S-49A2',
    action: 'Status Escapated to Critical',
    target: 'Incident #8891',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'aud-003',
    event_type: 'auth',
    actor: 'S-11X9',
    action: 'Secure Authentication Verified',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  }
];

const getIconForEvent = (type: string) => {
  switch (type) {
    case 'auth': return <User className="h-4 w-4 text-blue-400" />;
    case 'incident': return <AlertCircle className="h-4 w-4 text-orange-400" />;
    case 'rbac': return <ShieldCheck className="h-4 w-4 text-emerald-400" />;
    default: return <Settings className="h-4 w-4 text-zinc-400" />;
  }
};

export default function AuditFeed() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6 mb-6">
        <h3 className="text-lg font-semibold text-white">Platform Audit Log</h3>
        <button className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">
          View Complete Ledger
        </button>
      </div>
      
      <div className="space-y-4 overflow-y-auto flex-1 pr-2">
        {mockAuditLogs.map((log) => (
          <div key={log.id} className="flex items-start space-x-4 rounded-xl border border-zinc-800/50 bg-zinc-950/50 p-4 transition-colors hover:bg-zinc-800/40">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
              log.event_type === 'auth' ? "border-blue-500/20 bg-blue-500/10" :
              log.event_type === 'incident' ? "border-orange-500/20 bg-orange-500/10" :
              log.event_type === 'rbac' ? "border-emerald-500/20 bg-emerald-500/10" :
              "border-zinc-500/20 bg-zinc-500/10"
            )}>
              {getIconForEvent(log.event_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{log.action}</p>
              <p className="mt-1 flex items-center text-[10px] uppercase tracking-wider text-zinc-500">
                <span className="font-semibold text-zinc-400">{log.actor}</span>
                {log.target && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{log.target}</span>
                  </>
                )}
              </p>
            </div>
            
            <span className="shrink-0 text-[10px] font-medium text-zinc-600">
              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
