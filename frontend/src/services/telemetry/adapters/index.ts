import { normalizePrometheusMatrix, PrometheusResponse } from '../normalizers/prometheus';
import { SystemMetrics } from '@/features/metrics/types';
import apiClient from '@/lib/api-client'; // The centralized Axios instance

/**
 * Enterprise Telemetry Adapter.
 * This bridges the gap between the frontend UI and the FastAPI/Prometheus backend.
 */
export const telemetryAdapter = {
  /**
   * Fetches the current aggregated system metrics from the backend observability endpoints.
   */
  getLiveMetrics: async (): Promise<SystemMetrics> => {
    // In a true production deployment, this hits our FastAPI Gateway, 
    // which internally queries Prometheus or Datadog to aggregate this payload.
    // For now, if the backend endpoint isn't ready, this serves as the exact structural contract.
    try {
      const response = await apiClient.get<SystemMetrics>('/api/v1/telemetry/system');
      return response.data;
    } catch (error) {
      // Fallback or re-throw depending on global error strategy
      throw new Error('Failed to fetch telemetry from gateway');
    }
  },

  /**
   * Directly query a specific Prometheus metric (e.g., container_cpu_usage_seconds_total)
   */
  queryPrometheusRange: async (query: string, start: number, end: number, step: number) => {
    const response = await apiClient.get<PrometheusResponse>('/api/v1/telemetry/prometheus/query_range', {
      params: { query, start, end, step }
    });
    return normalizePrometheusMatrix(response.data);
  }
};
