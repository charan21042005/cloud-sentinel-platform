'use client';

import React, { useState } from 'react';
import IncidentTable from '@/features/incidents/components/IncidentTable';
import IncidentFilters from '@/features/incidents/components/IncidentFilters';
import IncidentDetail from '@/features/incidents/components/IncidentDetail';
import { useIncidents } from '@/features/incidents/hooks/useIncidents';
import { useWebSocket } from '@/features/incidents/hooks/useWebSocket';
import { IncidentSeverity, IncidentStatus, Incident } from '@/features/incidents/types';
import { Plus, Radio } from 'lucide-react';

export default function IncidentsPage() {
  const [filters, setFilters] = useState({
    search: '',
    severity: 'all' as IncidentSeverity | 'all',
    status: 'all' as IncidentStatus | 'all',
  });

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Initialize dual-channel real-time SOC transport streaming with zero manual polling
  const { isConnected: isIncidentsConnected, isReconnecting: isIncidentsReconnecting } = useWebSocket('incidents');
  useWebSocket('system-events');

  const { data, isLoading } = useIncidents({
    search: filters.search,
    severity: filters.severity === 'all' ? undefined : filters.severity,
    status: filters.status === 'all' ? undefined : filters.status,
  });

  return (
    <div className="relative space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <span>Incident Center</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-[10px] text-red-500 border border-red-500/20 font-mono">
                {Array.isArray(data) ? data.length : 0}
              </div>
            </h1>
            
            {/* Live Operations Fabric Streaming Indicators */}
            <div className="flex items-center space-x-2 rounded-full bg-zinc-900/80 px-3 py-1 border border-zinc-800 backdrop-blur-sm">
              <Radio className={`h-3.5 w-3.5 ${isIncidentsConnected ? 'text-emerald-400 animate-pulse' : isIncidentsReconnecting ? 'text-amber-400 animate-spin' : 'text-zinc-600'}`} />
              <span className="text-xs font-mono font-medium tracking-wider">
                {isIncidentsConnected ? (
                  <span className="text-emerald-400">LIVE STREAMING</span>
                ) : isIncidentsReconnecting ? (
                  <span className="text-amber-400">RECONNECTING...</span>
                ) : (
                  <span className="text-zinc-500">STANDBY</span>
                )}
              </span>
            </div>
          </div>
          <p className="mt-2 text-zinc-400">Real-time SRE telemetry orchestration, zero-polling WebSocket threat streams, and collaborative SOC workflows.</p>
        </div>

        <button className="flex items-center space-x-2 rounded-xl bg-zinc-100 px-5 py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-200">
          <Plus className="h-5 w-5" />
          <span>Manual Alert Injector</span>
        </button>
      </div>

      <IncidentFilters 
        onSearchChange={(search) => setFilters(f => ({ ...f, search }))}
        onSeverityChange={(severity) => setFilters(f => ({ ...f, severity }))}
        onStatusChange={(status) => setFilters(f => ({ ...f, status }))}
      />

      <div className="mt-8">
        <IncidentTable 
          incidents={Array.isArray(data) ? data : undefined} 
          isLoading={isLoading} 
          onRowClick={(incident) => setSelectedIncident(incident)}
        />
      </div>

      <IncidentDetail 
        incident={selectedIncident}
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    </div>
  );
}
