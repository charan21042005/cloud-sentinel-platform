import { SystemMetrics, TimeSeriesDataPoint } from '../types';
import { PrometheusClient } from '../../../services/telemetry/api/client';
import { PROMQL_QUERIES } from '../../../services/telemetry/queries';
import { TelemetryTransformer } from '../../../services/telemetry/transformers';

export const metricsApi = {
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    try {
      // 1. Calculate time ranges for history (last 5 minutes, 15-second resolution)
      const end = Math.floor(Date.now() / 1000);
      const start = end - (5 * 60); 
      const step = '15s';

      // 2. Execute PromQL Instant Queries (Parallelized for performance)
      const [cpu, memory, requests, latency] = await Promise.all([
        PrometheusClient.query(PROMQL_QUERIES.CPU_UTILIZATION),
        PrometheusClient.query(PROMQL_QUERIES.MEMORY_UTILIZATION),
        PrometheusClient.query(PROMQL_QUERIES.REQUEST_THROUGHPUT),
        PrometheusClient.query(PROMQL_QUERIES.API_LATENCY)
      ]);

      // 3. Execute PromQL Range Queries (For Area Charts)
      const [rawCpuHistory, rawMemoryHistory] = await Promise.all([
        PrometheusClient.queryRange(PROMQL_QUERIES.CPU_HISTORY, start, end, step),
        PrometheusClient.queryRange(PROMQL_QUERIES.MEMORY_HISTORY, start, end, step)
      ]);

      // 4. Normalize and Transform
      const historyCpu = TelemetryTransformer.normalizeTimeSeries(rawCpuHistory);
      const historyMemory = TelemetryTransformer.normalizeTimeSeries(rawMemoryHistory);

      return {
        cpu_usage: Number(cpu.toFixed(1)),
        memory_usage: Number(memory.toFixed(1)),
        active_requests: Math.floor(requests), // Requests per second
        latency_ms: Number(latency.toFixed(1)),
        history: {
          cpu: historyCpu,
          memory: historyMemory,
        }
      };
    } catch (error) {
      console.error("[Metrics API] Complete telemetry failure, degrading to fallback state:", error);
      
      // Fallback state (Safe Degradation UX)
      return {
        cpu_usage: 0,
        memory_usage: 0,
        active_requests: 0,
        latency_ms: 0,
        history: { cpu: [], memory: [] }
      };
    }
  }
};
