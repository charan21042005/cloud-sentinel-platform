'use client';

import React from 'react';
import { Cpu, MemoryStick, Activity, Network, Radio } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import MetricCard from './MetricCard';
import TimeSeriesChart from './TimeSeriesChart';
import { useSystemMetrics } from '../hooks/useMetrics';
import Skeleton from '@/components/ui/Skeleton';

const STALE_AFTER_MS = 45_000;

function latestSampleTime(data: { timestamp: string }[]): number | null {
  const timestamps = data
    .map((point) => Date.parse(point.timestamp))
    .filter(Number.isFinite);
  return timestamps.length ? Math.max(...timestamps) : null;
}

function metricValue(value: number | null, suffix: string, stale: boolean): string {
  return value === null || stale ? 'Unavailable' : `${value}${suffix}`;
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MetricsDashboard() {
  const { data, isLoading, error } = useSystemMetrics();
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    const updateClock = () => setNow(Date.now());
    updateClock();
    const timer = setInterval(updateClock, 10_000);
    return () => clearInterval(timer);
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-500 text-sm">
        Failed to stream telemetry data. The system is attempting to reconnect...
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <Skeleton className="h-6 w-44 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const isPrometheus = data.source === 'prometheus';
  const isSimulated = data.source === 'simulated';
  const newestSample = latestSampleTime([...data.history.cpu, ...data.history.memory]);
  const isStale =
    now === null ||
    newestSample === null ||
    now - newestSample > STALE_AFTER_MS ||
    newestSample > now;
  const sourceLabel = isPrometheus
    ? isStale ? 'PROMETHEUS (STALE)' : 'PROMETHEUS (LIVE)'
    : isSimulated
      ? isStale ? 'SIMULATED (STALE)' : 'SIMULATED (DEMO FALLBACK)'
      : 'SOURCE UNKNOWN';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
          <Radio className="h-3.5 w-3.5 text-zinc-500" />
          <span>Cluster Telemetry Stream</span>
        </div>
        <div
          data-testid="telemetry-source-badge"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide border transition-all duration-300",
            isPrometheus
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10"
              : isSimulated
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/10"
                : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300 shadow-sm shadow-zinc-500/10"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isPrometheus ? "bg-emerald-400 animate-pulse" : isSimulated ? "bg-amber-400" : "bg-zinc-400"
            )}
          />
          <span>{sourceLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Compute (CPU)" 
          value={metricValue(data.cpu_usage, '%', isStale)}
          icon={Cpu}
          className="col-span-1 lg:col-span-2"
        >
          <TimeSeriesChart 
            data={data.history.cpu} 
            color="#3b82f6" // blue-500
            valueSuffix="%" 
            isStale={isStale}
          />
        </MetricCard>

        <MetricCard 
          title="Memory Allocation" 
          value={metricValue(data.memory_usage, '%', isStale)}
          icon={MemoryStick}
          className="col-span-1 lg:col-span-2"
        >
          <TimeSeriesChart 
            data={data.history.memory} 
            color="#8b5cf6" // violet-500
            valueSuffix="%" 
            isStale={isStale}
          />
        </MetricCard>

        <MetricCard 
          title="Request Throughput"
          value={metricValue(data.request_rate_per_second, ' req/s', isStale)}
          icon={Activity}
          className="col-span-1 lg:col-span-2"
        />

        <MetricCard 
          title="Global Latency" 
          value={metricValue(data.latency_ms, 'ms', isStale)}
          icon={Network}
          className="col-span-1 lg:col-span-2"
        />
      </div>
    </div>
  );
}
