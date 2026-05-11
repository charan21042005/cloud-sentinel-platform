import apiClient from '@/lib/api-client';
import { Incident, IncidentFilters, PaginatedIncidents } from '../types';

export const incidentApi = {
  getIncidents: async (filters: IncidentFilters): Promise<PaginatedIncidents> => {
    const response = await apiClient.get<PaginatedIncidents>('/incidents/', {
      params: filters,
    });
    return response.data;
  },

  getIncidentById: async (id: string): Promise<Incident> => {
    const response = await apiClient.get<Incident>(`/incidents/${id}`);
    return response.data;
  },

  updateIncidentStatus: async (id: string, status: string): Promise<Incident> => {
    const response = await apiClient.patch<Incident>(`/incidents/${id}/status`, { status });
    return response.data;
  },
};
