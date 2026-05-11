'use client';

import React, { useState } from 'react';
import IncidentTable from '@/features/incidents/components/IncidentTable';
import IncidentFilters from '@/features/incidents/components/IncidentFilters';
import IncidentDetail from '@/features/incidents/components/IncidentDetail';
import { useIncidents } from '@/features/incidents/hooks/useIncidents';
import { IncidentSeverity, IncidentStatus, Incident } from '@/features/incidents/types';
import { Plus } from 'lucide-react';

export default function IncidentsPage() {
  const [filters, setFilters] = useState({
    search: '',
    severity: 'all' as IncidentSeverity | 'all',
    status: 'all' as IncidentStatus | 'all',
  });

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const { data, isLoading } = useIncidents({
    search: filters.search,
    severity: filters.severity === 'all' ? undefined : filters.severity,
    status: filters.status === 'all' ? undefined : filters.status,
  });

  return (
    <div className="relative space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <span>Incident Feed</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-[10px] text-red-500 border border-red-500/20">
              {data?.total || 0}
            </div>
          </h1>
          <p className="mt-2 text-zinc-400">Manage and respond to active threats across your cloud ecosystem.</p>
        </div>

        <button className="flex items-center space-x-2 rounded-xl bg-zinc-100 px-5 py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-200">
          <Plus className="h-5 w-5" />
          <span>Report Incident</span>
        </button>
      </div>

      <IncidentFilters 
        onSearchChange={(search) => setFilters(f => ({ ...f, search }))}
        onSeverityChange={(severity) => setFilters(f => ({ ...f, severity }))}
        onStatusChange={(status) => setFilters(f => ({ ...f, status }))}
      />

      <div className="mt-8">
        <IncidentTable 
          incidents={data?.items} 
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
