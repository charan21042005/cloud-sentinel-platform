import { SystemMetrics, TimeSeriesDataPoint } from '../types';

// Simulate historical data generation
const generateHistory = (baseValue: number, volatility: number, count: number): TimeSeriesDataPoint[] => {
  const now = Date.now();
  return Array.from({ length: count }).map((_, i) => {
    // Generate a somewhat realistic walk
    const value = Math.max(0, Math.min(100, baseValue + (Math.random() * volatility * 2 - volatility)));
    return {
      timestamp: new Date(now - (count - i) * 5000).toISOString(),
      value: Number(value.toFixed(1)),
    };
  });
};

// Maintain simulated state across polls
let currentCpu = 45.2;
let currentMemory = 62.1;
let historyCpu = generateHistory(45, 10, 20);
let historyMemory = generateHistory(60, 5, 20);

export const metricsApi = {
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));

    const now = new Date().toISOString();

    // Walk the values slightly
    currentCpu = Math.max(5, Math.min(95, currentCpu + (Math.random() * 8 - 4)));
    currentMemory = Math.max(20, Math.min(90, currentMemory + (Math.random() * 4 - 2)));

    const newCpuPoint = { timestamp: now, value: Number(currentCpu.toFixed(1)) };
    const newMemoryPoint = { timestamp: now, value: Number(currentMemory.toFixed(1)) };

    // Update history (keep last 20 points)
    historyCpu = [...historyCpu.slice(1), newCpuPoint];
    historyMemory = [...historyMemory.slice(1), newMemoryPoint];

    return {
      cpu_usage: newCpuPoint.value,
      memory_usage: newMemoryPoint.value,
      active_requests: Math.floor(Math.random() * 500) + 1200,
      latency_ms: Math.floor(Math.random() * 40) + 20,
      history: {
        cpu: historyCpu,
        memory: historyMemory,
      }
    };
  }
};
