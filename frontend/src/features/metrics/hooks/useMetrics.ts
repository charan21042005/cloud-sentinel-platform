import { usePolling } from '@/services/realtime/usePolling';
import { metricsApi } from '../api';
import { SystemMetrics } from '../types';

export function useSystemMetrics() {
  return usePolling<SystemMetrics>(
    ['system-metrics'],
    () => metricsApi.getSystemMetrics(),
    {
      intervalMs: 5000, // Poll every 5 seconds
      pauseWhenHidden: true, // Save resources when tab is inactive
    }
  );
}
