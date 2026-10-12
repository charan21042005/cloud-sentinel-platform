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

function isFresh(timestamp: string | null | undefined, now: number | null): boolean {
  if (now === null || !timestamp) return false;
  const sampleTime = Date.parse(timestamp);
  return Number.isFinite(sampleTime) && sampleTime <= now && now - sampleTime <= STALE_AFTER_MS;
}

function isFreshSampleTime(sampleTime: number | null, now: number | null): boolean {
  return sampleTime !== null && now !== null && sampleTime <= now && now - sampleTime <= STALE_AFTER_MS;
}

function metricValue(value: number | null, suffix: string, fresh: boolean): string {
  return value === null || !fresh ? 'Unavailable' : `${value}${suffix}`;
}

function metricStatus(value: number | null, timestamp: string | null | undefined, fresh: boolean) {
  if (timestamp && !fresh) return { message: 'Current sample is stale.', tone: 'stale' as const };
  if (value === null) return { message: 'Current sample unavailable.', tone: 'unavailable' as const };
  return undefined;
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

  if (isLoading || !data || now === null) {
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
  const metricFreshness = {
    cpu: isFresh(data.metric_timestamps?.cpu_usage, now),
    memory: isFresh(data.metric_timestamps?.memory_usage, now),
    requests: isFresh(data.metric_timestamps?.request_rate_per_second, now),
    latency: isFresh(data.metric_timestamps?.latency_ms, now),
  };
  const cpuHistoryTime = latestSampleTime(data.history.cpu);
  const memoryHistoryTime = latestSampleTime(data.history.memory);
  const cpuHistoryStale = !isFreshSampleTime(cpuHistoryTime, now);
  const memoryHistoryStale = !isFreshSampleTime(memoryHistoryTime, now);
  const sourceConnected = data.source_reachable === true && isFresh(data.source_checked_at, now);
  const cpuReady = data.cpu_usage !== null && metricFreshness.cpu && !cpuHistoryStale;
  const memoryReady = data.memory_usage !== null && metricFreshness.memory && !memoryHistoryStale;
  const requestsReady = data.request_rate_per_second !== null && metricFreshness.requests;
  const latencyReady = data.latency_ms !== null && metricFreshness.latency;
  const requiredMetricsReady = cpuReady && memoryReady && requestsReady && latencyReady;
  const hasAnyReadyMetric = cpuReady || memoryReady || requestsReady || latencyReady;
  const isPrometheusLive = isPrometheus && sourceConnected && requiredMetricsReady;
  const sourceLabel = isPrometheus
    ? data.source_reachable === false
      ? 'PROMETHEUS (DISCONNECTED)'
      : !sourceConnected
        ? 'PROMETHEUS (CONNECTION UNKNOWN)'
        : isPrometheusLive
          ? 'PROMETHEUS (LIVE)'
          : hasAnyReadyMetric
            ? 'PROMETHEUS (PARTIAL)'
            : 'PROMETHEUS (STALE)'
    : isSimulated
      ? 'SIMULATED (DEMO FALLBACK)'
      : 'SOURCE UNKNOWN';
  const connectionLabel = data.source_reachable === true && isFresh(data.source_checked_at, now)
    ? 'Prometheus reachable'
    : data.source_reachable === false
      ? 'Prometheus unreachable'
      : 'Prometheus status unknown';
  const cpuStatus = metricStatus(data.cpu_usage, data.metric_timestamps?.cpu_usage, metricFreshness.cpu);
  const memoryStatus = metricStatus(data.memory_usage, data.metric_timestamps?.memory_usage, metricFreshness.memory);
  const requestsStatus = metricStatus(data.request_rate_per_second, data.metric_timestamps?.request_rate_per_second, metricFreshness.requests);
  const latencyStatus = metricStatus(data.latency_ms, data.metric_timestamps?.latency_ms, metricFreshness.latency);

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
            isPrometheusLive
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10"
              : isPrometheus
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/10"
              : isSimulated
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/10"
                : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300 shadow-sm shadow-zinc-500/10"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isPrometheusLive ? "bg-emerald-400 animate-pulse" : isPrometheus || isSimulated ? "bg-amber-400" : "bg-zinc-400"
            )}
          />
          <span>{sourceLabel}</span>
        </div>
        <span data-testid="telemetry-connectivity" className="text-xs text-zinc-500">
          {connectionLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Compute (CPU)" 
          value={metricValue(data.cpu_usage, '%', metricFreshness.cpu)}
          statusMessage={cpuStatus?.message ?? (cpuHistoryStale && cpuHistoryTime !== null ? 'Historical CPU samples are stale.' : undefined)}
          statusTone={cpuStatus?.tone ?? (cpuHistoryStale ? 'stale' : 'unavailable')}
          icon={Cpu}
          className="col-span-1 lg:col-span-2"
        >
          <TimeSeriesChart 
            data={data.history.cpu} 
            color="#3b82f6" // blue-500
            valueSuffix="%" 
            isStale={cpuHistoryStale}
          />
        </MetricCard>

        <MetricCard 
          title="Memory Allocation" 
          value={metricValue(data.memory_usage, '%', metricFreshness.memory)}
          statusMessage={memoryStatus?.message ?? (memoryHistoryStale && memoryHistoryTime !== null ? 'Historical memory samples are stale.' : undefined)}
          statusTone={memoryStatus?.tone ?? (memoryHistoryStale ? 'stale' : 'unavailable')}
          icon={MemoryStick}
          className="col-span-1 lg:col-span-2"
        >
          <TimeSeriesChart 
            data={data.history.memory} 
            color="#8b5cf6" // violet-500
            valueSuffix="%" 
            isStale={memoryHistoryStale}
          />
        </MetricCard>

        <MetricCard 
          title="Request Throughput"
          value={metricValue(data.request_rate_per_second, ' req/s', metricFreshness.requests)}
          statusMessage={requestsStatus?.message}
          statusTone={requestsStatus?.tone}
          icon={Activity}
          className="col-span-1 lg:col-span-2"
        />

        <MetricCard 
          title="Global Latency" 
          value={metricValue(data.latency_ms, 'ms', metricFreshness.latency)}
          statusMessage={latencyStatus?.message}
          statusTone={latencyStatus?.tone}
          icon={Network}
          className="col-span-1 lg:col-span-2"
        />
      </div>
    </div>
  );
}
