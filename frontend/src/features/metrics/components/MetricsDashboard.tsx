'use client';

import React from 'react';
import { Cpu, MemoryStick, Activity, Network } from 'lucide-react';
import MetricCard from './MetricCard';
import TimeSeriesChart from './TimeSeriesChart';
import { useSystemMetrics } from '../hooks/useMetrics';
import Skeleton from '@/components/ui/Skeleton';

export default function MetricsDashboard() {
  const { data, isLoading, error } = useSystemMetrics();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-500 text-sm">
        Failed to stream telemetry data. The system is attempting to reconnect...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard 
        title="Compute (CPU)" 
        value={`${data.cpu_usage}%`} 
        icon={Cpu}
        trend={{ value: 2.4, isPositive: false }}
        className="col-span-1 lg:col-span-2"
      >
        <TimeSeriesChart 
          data={data.history.cpu} 
          color="#3b82f6" // blue-500
          valueSuffix="%" 
        />
      </MetricCard>

      <MetricCard 
        title="Memory Allocation" 
        value={`${data.memory_usage}%`} 
        icon={MemoryStick}
        trend={{ value: 0.8, isPositive: true }}
        className="col-span-1 lg:col-span-2"
      >
        <TimeSeriesChart 
          data={data.history.memory} 
          color="#8b5cf6" // violet-500
          valueSuffix="%" 
        />
      </MetricCard>

      <MetricCard 
        title="Active Requests" 
        value={data.active_requests.toLocaleString()} 
        icon={Activity}
        className="col-span-1 lg:col-span-2"
      />

      <MetricCard 
        title="Global Latency" 
        value={`${data.latency_ms}ms`} 
        icon={Network}
        className="col-span-1 lg:col-span-2"
      />
    </div>
  );
}
