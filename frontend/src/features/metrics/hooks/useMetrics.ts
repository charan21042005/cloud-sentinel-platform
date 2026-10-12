import { usePolling } from '@/services/realtime/polling/usePolling';
import { useQueryClient } from '@tanstack/react-query';
import { metricsApi } from '../api';
import { SystemMetrics, TimeSeriesDataPoint } from '../types';

const MAX_HISTORY_POINTS = 100;
const METRIC_KEYS = [
  'cpu_usage',
  'memory_usage',
  'request_rate_per_second',
  'latency_ms',
] as const;

export function mergeMetricHistory(
  previous: TimeSeriesDataPoint[],
  current: TimeSeriesDataPoint[],
): TimeSeriesDataPoint[] {
  const pointsByTimestamp = new Map<string, TimeSeriesDataPoint>();
  for (const point of [...previous, ...current]) {
    if (Number.isFinite(Date.parse(point.timestamp)) && Number.isFinite(point.value)) {
      pointsByTimestamp.set(point.timestamp, point);
    }
  }
  return [...pointsByTimestamp.values()]
    .sort((left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp))
    .slice(-MAX_HISTORY_POINTS);
}

export function mergeSystemMetrics(previous: SystemMetrics, current: SystemMetrics): SystemMetrics {
  const previousResponse = Date.parse(previous.response_started_at ?? '');
  const currentResponse = Date.parse(current.response_started_at ?? '');
  if (Number.isFinite(previousResponse) && Number.isFinite(currentResponse) && currentResponse < previousResponse) {
    return previous;
  }
  if (previous.source !== current.source) return current;

  const merged = { ...current, metric_timestamps: { ...current.metric_timestamps } };
  for (const key of METRIC_KEYS) {
    const previousTimestamp = Date.parse(previous.metric_timestamps?.[key] ?? '');
    const currentTimestamp = Date.parse(current.metric_timestamps?.[key] ?? '');
    const currentIsOlder = Number.isFinite(previousTimestamp) &&
      (!Number.isFinite(currentTimestamp) || currentTimestamp < previousTimestamp);
    if (currentIsOlder) {
      merged[key] = previous[key];
      merged.metric_timestamps[key] = previous.metric_timestamps?.[key] ?? null;
    }
  }

  const previousSourceCheck = Date.parse(previous.source_checked_at ?? '');
  const currentSourceCheck = Date.parse(current.source_checked_at ?? '');
  if (Number.isFinite(previousSourceCheck) &&
      (!Number.isFinite(currentSourceCheck) || currentSourceCheck < previousSourceCheck)) {
    merged.source_reachable = previous.source_reachable;
    merged.source_checked_at = previous.source_checked_at;
  }

  return {
    ...merged,
    history: {
      cpu: mergeMetricHistory(previous.history.cpu, current.history.cpu),
      memory: mergeMetricHistory(previous.history.memory, current.history.memory),
    },
  };
}

export function useSystemMetrics() {
  const queryClient = useQueryClient();
  return usePolling<SystemMetrics>(
    ['system-metrics'],
    async () => {
      const current = await metricsApi.getSystemMetrics();
      const previous = queryClient.getQueryData<SystemMetrics>(['system-metrics']);
      return previous ? mergeSystemMetrics(previous, current) : current;
    },
    {
      intervalMs: 5000, // Poll every 5 seconds
      pauseWhenHidden: true, // Save resources when tab is inactive
    }
  );
}
