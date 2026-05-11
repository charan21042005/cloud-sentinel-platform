'use client';

import React from 'react';
import { useAlerts, useAcknowledgeAlert } from '../hooks/useAlerts';
import { ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AlertFeed() {
  const { data: alerts, isLoading } = useAlerts();
  const acknowledgeMutation = useAcknowledgeAlert();

  if (isLoading) {
    return <div className="p-4 text-center text-xs text-zinc-500">Syncing telemetry...</div>;
  }

  if (!alerts || alerts.length === 0) {
    return <div className="p-4 text-center text-xs text-zinc-500">No active alerts. System secure.</div>;
  }

  const unacknowledgedAlerts = alerts.filter(a => a.status === 'new');

  return (
    <div className="flex flex-col space-y-2 max-h-96 overflow-y-auto p-2">
      {unacknowledgedAlerts.length === 0 && (
        <div className="p-4 text-center text-xs text-emerald-500 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          All active alerts have been acknowledged.
        </div>
      )}
      
      {alerts.map((alert) => (
        <div 
          key={alert.id}
          className={cn(
            "rounded-xl border p-4 transition-all",
            alert.status === 'acknowledged' ? "border-zinc-800 bg-zinc-900/40 opacity-70" : 
            alert.severity === 'critical' ? "border-red-500/30 bg-red-500/10" : 
            "border-orange-500/30 bg-orange-500/10"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className={cn(
                "h-4 w-4",
                alert.status === 'acknowledged' ? "text-zinc-500" :
                alert.severity === 'critical' ? "text-red-500 animate-pulse" : "text-orange-500"
              )} />
              <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">{alert.source}</span>
          </div>
          
          <p className="mt-2 text-xs text-zinc-400">{alert.message}</p>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-1 text-[10px] text-zinc-500">
              <Clock className="h-3 w-3" />
              <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
            
            {alert.status === 'new' && (
              <button 
                onClick={() => acknowledgeMutation.mutate(alert.id)}
                disabled={acknowledgeMutation.isPending}
                className="flex items-center space-x-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-colors"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Acknowledge</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
