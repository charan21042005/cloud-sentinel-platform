export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
}

export interface SystemMetrics {
  source?: 'prometheus' | 'simulated';
  cpu_usage: number;
  memory_usage: number;
  active_requests: number;
  latency_ms: number;
  history: {
    cpu: TimeSeriesDataPoint[];
    memory: TimeSeriesDataPoint[];
  };
}
