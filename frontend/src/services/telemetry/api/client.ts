import { PrometheusResponse } from '../types';

const PROMETHEUS_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/telemetry` 
  : 'http://localhost:8000/api/v1/telemetry';

export class PrometheusClient {
  /**
   * Executes an instant query (single point in time)
   */
  static async query(query: string): Promise<number> {
    try {
      const response = await fetch(`${PROMETHEUS_URL}/query?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Prometheus API error: ${response.statusText}`);
      }

      const data: PrometheusResponse = await response.json();
      
      if (data.status !== 'success' || !data.data.result.length) {
        return 0; // Fallback to 0 if no telemetry is available
      }

      // Extract the numeric value from the ["timestamp", "value"] tuple
      const resultValue = data.data.result[0].value;
      if (!resultValue) return 0;
      
      const parsed = parseFloat(resultValue[1]);
      return isNaN(parsed) ? 0 : parsed;
      
    } catch (error) {
      console.warn(`[Telemetry Service] Failed to execute instant query: ${query}`, error);
      return 0;
    }
  }

  /**
   * Executes a range query (time series data)
   */
  static async queryRange(query: string, start: number, end: number, step: string): Promise<[number, string][]> {
    try {
      const params = new URLSearchParams({
        query,
        start: start.toString(),
        end: end.toString(),
        step
      });

      const response = await fetch(`${PROMETHEUS_URL}/query_range?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Prometheus API error: ${response.statusText}`);
      }

      const data: PrometheusResponse = await response.json();
      
      if (data.status !== 'success' || !data.data.result.length) {
        return [];
      }

      return data.data.result[0].values || [];
      
    } catch (error) {
      console.warn(`[Telemetry Service] Failed to execute range query: ${query}`, error);
      return [];
    }
  }
}
