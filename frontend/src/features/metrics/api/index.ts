import { SystemMetrics } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const metricsApi = {
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    try {
      const response = await fetch(`${API_URL}/telemetry/system/live`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch telemetry DTO: ${response.statusText}`);
      }
      
      // The backend now provides the exact SystemMetrics shape. 
      // The frontend is completely agnostic to PromQL or TSDB logic.
      return await response.json();
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
