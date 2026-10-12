export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
}

export interface SystemMetrics {
  source?: 'prometheus' | 'simulated';
  cpu_usage: number | null;
  memory_usage: number | null;
  request_rate_per_second: number | null;
  latency_ms: number | null;
  history: {
    cpu: TimeSeriesDataPoint[];
    memory: TimeSeriesDataPoint[];
  };
}
