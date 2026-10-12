import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/api-client';
import { metricsApi } from './index';
import type { SystemMetrics } from '../types';

vi.mock('@/lib/api-client', () => ({
  default: { get: vi.fn() },
}));

describe('metricsApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses the authenticated API client and returns the backend telemetry payload', async () => {
    const payload: SystemMetrics = {
      source: 'prometheus',
      cpu_usage: 21.4,
      memory_usage: 42.8,
      request_rate_per_second: 0.4,
      latency_ms: 12.3,
      history: { cpu: [], memory: [] },
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: payload });

    await expect(metricsApi.getSystemMetrics()).resolves.toBe(payload);
    expect(apiClient.get).toHaveBeenCalledWith('/telemetry/system/live');
  });

  it('propagates authorization and service failures instead of inventing zero values', async () => {
    const failure = new Error('request rejected');
    vi.mocked(apiClient.get).mockRejectedValue(failure);

    await expect(metricsApi.getSystemMetrics()).rejects.toBe(failure);
  });
});
