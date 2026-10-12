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
  metric_timestamps?: {
    cpu_usage?: string | null;
    memory_usage?: string | null;
    request_rate_per_second?: string | null;
    latency_ms?: string | null;
  };
  source_reachable?: boolean | null;
  source_checked_at?: string | null;
  response_started_at?: string | null;
  history: {
    cpu: TimeSeriesDataPoint[];
    memory: TimeSeriesDataPoint[];
  };
}
