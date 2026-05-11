import { TimeSeriesDataPoint } from '@/features/metrics/types';

export interface PrometheusVector {
  metric: Record<string, string>;
  value: [number, string]; // [timestamp, "value"]
}

export interface PrometheusMatrix {
  metric: Record<string, string>;
  values: [number, string][]; // Array of [timestamp, "value"]
}

export interface PrometheusResponse {
  status: string;
  data: {
    resultType: 'vector' | 'matrix';
    result: PrometheusVector[] | PrometheusMatrix[];
  };
}

/**
 * Normalizes raw Prometheus Matrix data into our platform's standard TimeSeriesDataPoint array.
 * Converts Unix epoch timestamps to ISO strings and parses string values to floats.
 */
export const normalizePrometheusMatrix = (
  response: PrometheusResponse, 
  maxPoints: number = 60
): TimeSeriesDataPoint[] => {
  if (response.status !== 'success' || response.data.resultType !== 'matrix') {
    return [];
  }

  const result = response.data.result[0] as PrometheusMatrix;
  if (!result || !result.values) return [];

  // Slice to max points to guarantee frontend rendering performance
  const rawValues = result.values.slice(-maxPoints);

  return rawValues.map(([timestamp, stringValue]) => ({
    timestamp: new Date(timestamp * 1000).toISOString(),
    value: Number(parseFloat(stringValue).toFixed(2)),
  }));
};
