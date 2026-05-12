import { NormalizedTelemetryPoint } from '../types';

export const TelemetryTransformer = {
  /**
   * Converts raw Prometheus range query results [[unix_timestamp, "value"], ...]
   * into our React components' required format [{ timestamp: ISOString, value: number }]
   */
  normalizeTimeSeries(rawValues: [number, string][]): NormalizedTelemetryPoint[] {
    return rawValues.map(([unixTime, stringValue]) => ({
      // Prometheus returns seconds, JS Date needs milliseconds
      timestamp: new Date(unixTime * 1000).toISOString(),
      value: Number(parseFloat(stringValue).toFixed(1))
    }));
  }
};
