'use client';

import React from 'react';
import { Incident } from '../types';
import StatusBadge from '@/components/ui/StatusBadge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { AlertTriangle, Layers, Activity, Flame } from 'lucide-react';

interface IncidentTableProps {
  incidents?: Incident[];
  isLoading: boolean;
  onRowClick: (incident: Incident) => void;
}

export default function IncidentTable({ incidents, isLoading, onRowClick }: IncidentTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl bg-zinc-900/60" />
        ))}
      </div>
    );
  }

  if (!incidents || incidents.length === 0) {
    return (
      <EmptyState 
        title="No active platform incidents" 
        description="The Alertmanager synchronization engine reports standard baseline profiles across all microservices."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-xl backdrop-blur-md">
      <table className="w-full text-left">
        <thead className="border-b border-zinc-800/80 bg-zinc-900/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="px-6 py-4">Threat Fingerprint / Summary</th>
            <th className="px-4 py-4">Affected Service</th>
            <th className="px-4 py-4 text-center">Correlation Vol</th>
            <th className="px-4 py-4">State Lifecycle</th>
            <th className="px-6 py-4 text-right">Triggered At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900">
          {incidents.map((incident) => {
            const isCritical = incident.severity === 'critical';
            return (
              <tr 
                key={incident.id} 
                onClick={() => onRowClick(incident)}
                className={`group cursor-pointer transition-all hover:bg-zinc-900/50 ${isCritical ? 'bg-red-950/10 hover:bg-red-950/20' : ''}`}
              >
                <td className="px-6 py-5 max-w-md">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      <StatusBadge variant={incident.severity} label={incident.severity.toUpperCase()} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 truncate">
                        <p className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors truncate">
                          {incident.title}
                        </p>
                        {incident.escalation_level > 0 && (
                          <span className="inline-flex items-center rounded-md bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-bold text-orange-400 ring-1 ring-inset ring-orange-500/20">
                            <Flame size={9} className="mr-0.5" /> ESCALATED
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] font-mono text-zinc-500 truncate">
                        {incident.fingerprint}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center space-x-1.5">
                    <Activity size={13} className="text-zinc-600" />
                    <span className="text-xs font-medium text-zinc-400 max-w-[120px] truncate">
                      {incident.affected_service || 'Platform Core'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-5 text-center">
                  <div className="inline-flex items-center space-x-1 rounded-full bg-zinc-900 px-2.5 py-1 border border-zinc-800">
                    <Layers size={11} className="text-zinc-500" />
                    <span className="text-xs font-bold font-mono text-zinc-300">
                      {incident.occurrence_count}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center space-x-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${incident.status === 'firing' ? 'bg-red-500 animate-pulse' : incident.status === 'acknowledged' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
                      {incident.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-zinc-200">
                      {new Date(incident.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="mt-0.5 text-[10px] text-zinc-500">
                      {new Date(incident.triggered_at).toLocaleDateString()}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
