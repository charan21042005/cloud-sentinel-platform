import { SystemMetrics } from '../types';
import apiClient from '@/lib/api-client';

export const metricsApi = {
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    const response = await apiClient.get<SystemMetrics>('/telemetry/system/live');
    return response.data;
  }
};
