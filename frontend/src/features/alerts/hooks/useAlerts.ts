import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../api';
import { usePolling } from '@/services/realtime/polling/usePolling';
import { PlatformAlert } from '../types';
import { toast } from 'sonner';

export function useAlerts() {
  return usePolling<PlatformAlert[]>(
    ['platform-alerts'],
    () => alertsApi.getAlerts(),
    { intervalMs: 10000 } // Poll every 10 seconds for alerts
  );
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsApi.acknowledgeAlert(id),
    onSuccess: (data) => {
      // Instantly update the UI cache
      queryClient.setQueryData(['platform-alerts'], (oldData: PlatformAlert[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(alert => alert.id === data.id ? data : alert);
      });
      toast.success(`Alert ${data.id} acknowledged.`);
    },
    onError: () => {
      toast.error('Failed to acknowledge alert. Please try again.');
    }
  });
}
