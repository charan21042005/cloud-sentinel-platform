export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
}

export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  active_requests: number;
  latency_ms: number;
  history: {
    cpu: TimeSeriesDataPoint[];
    memory: TimeSeriesDataPoint[];
  };
}
