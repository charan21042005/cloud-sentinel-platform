import apiClient from '@/lib/api-client';
import { Incident, IncidentFilters } from '../types';

export const incidentApi = {
  getIncidents: async (filters: IncidentFilters): Promise<Incident[]> => {
    // Strip 'all' filtering parameters out before transmitting across the network
    const params: Record<string, any> = { ...filters };
    if (params.status === 'all') delete params.status;
    if (params.severity === 'all') delete params.severity;

    const response = await apiClient.get<Incident[]>('/incidents/', { params });
    return response.data;
  },

  acknowledgeIncident: async (id: string): Promise<Incident> => {
    const response = await apiClient.patch<Incident>(`/incidents/${id}/acknowledge`);
    return response.data;
  },

  resolveIncident: async (id: string): Promise<Incident> => {
    const response = await apiClient.patch<Incident>(`/incidents/${id}/resolve`);
    return response.data;
  },
};
