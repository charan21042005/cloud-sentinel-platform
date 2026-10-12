import { usePolling } from '@/services/realtime/polling/usePolling';
import { useQueryClient } from '@tanstack/react-query';
import { metricsApi } from '../api';
import { SystemMetrics, TimeSeriesDataPoint } from '../types';

const MAX_HISTORY_POINTS = 100;

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

export function useSystemMetrics() {
  const queryClient = useQueryClient();
  return usePolling<SystemMetrics>(
    ['system-metrics'],
    async () => {
      const current = await metricsApi.getSystemMetrics();
      const previous = queryClient.getQueryData<SystemMetrics>(['system-metrics']);
      if (!previous || previous.source !== current.source) return current;
      return {
        ...current,
        history: {
          cpu: mergeMetricHistory(previous.history.cpu, current.history.cpu),
          memory: mergeMetricHistory(previous.history.memory, current.history.memory),
        },
      };
    },
    {
      intervalMs: 5000, // Poll every 5 seconds
      pauseWhenHidden: true, // Save resources when tab is inactive
    }
  );
}
