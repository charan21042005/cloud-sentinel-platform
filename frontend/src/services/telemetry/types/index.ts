export interface PrometheusMetricResult {
  metric: Record<string, string>;
  value?: [number, string]; // [timestamp, "value"] for instant queries
  values?: [number, string][]; // [[timestamp, "value"]] for range queries
}

export interface PrometheusResponse {
  status: 'success' | 'error';
  data: {
    resultType: 'matrix' | 'vector' | 'scalar' | 'string';
    result: PrometheusMetricResult[];
  };
  errorType?: string;
  error?: string;
}

export interface NormalizedTelemetryPoint {
  timestamp: string;
  value: number;
}
