import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentApi } from '../api';
import { IncidentFilters } from '../types';

export function useIncidents(filters: IncidentFilters = {}) {
  return useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => incidentApi.getIncidents(filters),
    refetchInterval: 5000, // Highly-responsive live stream polling loops
    placeholderData: (previousData) => previousData,
  });
}

export function useAcknowledgeIncident() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => incidentApi.acknowledgeIncident(id),
    onSuccess: () => {
      // Invalidate both feed tracking arrays and individual details screens instantly
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useResolveIncident() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => incidentApi.resolveIncident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}
