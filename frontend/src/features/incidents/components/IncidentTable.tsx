'use client';

import React from 'react';
import { Incident } from '../types';
import StatusBadge from '@/components/ui/StatusBadge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { AlertCircle, Clock, User as UserIcon } from 'lucide-react';

interface IncidentTableProps {
  incidents?: Incident[];
  isLoading: boolean;
  onRowClick: (incident: Incident) => void;
}

export default function IncidentTable({ incidents, isLoading, onRowClick }: IncidentTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!incidents || incidents.length === 0) {
    return (
      <EmptyState 
        title="No active incidents" 
        description="The platform has not detected any threats in the current operational period."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <table className="w-full text-left">
        <thead className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <tr>
            <th className="px-6 py-4">Severity / Incident</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Reporter</th>
            <th className="px-6 py-4 text-right">Detected At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {incidents.map((incident) => (
            <tr 
              key={incident.id} 
              onClick={() => onRowClick(incident)}
              className="group cursor-pointer transition-colors hover:bg-zinc-800/30"
            >
              <td className="px-6 py-5">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    <StatusBadge variant={incident.severity} label={incident.severity.toUpperCase()} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {incident.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-1">{incident.description}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-medium text-zinc-300 capitalize">{incident.status}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center space-x-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
                    <UserIcon className="h-3 w-3" />
                  </div>
                  <span className="text-xs text-zinc-400">S-{incident.reporter_id.substring(0, 4)}</span>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-zinc-300">
                    {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="mt-1 text-[10px] text-zinc-600">
                    {new Date(incident.created_at).toLocaleDateString()}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
