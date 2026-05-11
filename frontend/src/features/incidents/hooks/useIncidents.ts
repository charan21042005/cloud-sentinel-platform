import { useQuery } from '@tanstack/react-query';
import { incidentApi } from '../api';
import { IncidentFilters } from '../types';

export function useIncidents(filters: IncidentFilters = {}) {
  return useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => incidentApi.getIncidents(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentApi.getIncidentById(id),
    enabled: !!id,
  });
}
