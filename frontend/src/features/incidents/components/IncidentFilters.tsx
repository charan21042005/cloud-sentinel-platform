'use client';

import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { IncidentSeverity, IncidentStatus } from '../types';

interface IncidentFiltersProps {
  onSearchChange: (value: string) => void;
  onSeverityChange: (value: IncidentSeverity | 'all') => void;
  onStatusChange: (value: IncidentStatus | 'all') => void;
}

export default function IncidentFilters({ 
  onSearchChange, 
  onSeverityChange, 
  onStatusChange 
}: IncidentFiltersProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input 
          type="text"
          placeholder="Filter incidents by title or description..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-0"
        />
      </div>

      <div className="flex items-center space-x-3">
        <select 
          onChange={(e) => onSeverityChange(e.target.value as any)}
          className="h-11 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 text-xs font-medium text-zinc-400 focus:border-zinc-600 focus:outline-none"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>

        <select 
          onChange={(e) => onStatusChange(e.target.value as any)}
          className="h-11 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 text-xs font-medium text-zinc-400 focus:border-zinc-600 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="firing">Firing</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>

        <button className="flex h-11 items-center space-x-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Advanced</span>
        </button>
      </div>
    </div>
  );
}
