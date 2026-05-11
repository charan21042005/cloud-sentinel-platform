import { PlatformAlert } from '../types';

let mockAlerts: PlatformAlert[] = [
  {
    id: 'alt-001',
    title: 'High CPU Utilization Detected',
    message: 'Node pool alpha-1 is sustaining >95% CPU for over 5 minutes.',
    severity: 'high',
    status: 'new',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    source: 'Prometheus',
  },
  {
    id: 'alt-002',
    title: 'Unauthorized IAM Role Assumption',
    message: 'Multiple failed assume-role attempts detected from unrecognized IP.',
    severity: 'critical',
    status: 'acknowledged',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    source: 'AWS CloudTrail',
  }
];

export const alertsApi = {
  getAlerts: async (): Promise<PlatformAlert[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...mockAlerts];
  },

  acknowledgeAlert: async (id: string): Promise<PlatformAlert> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const alertIndex = mockAlerts.findIndex(a => a.id === id);
    if (alertIndex === -1) throw new Error('Alert not found');
    
    const updatedAlert = { ...mockAlerts[alertIndex], status: 'acknowledged' as const };
    mockAlerts[alertIndex] = updatedAlert;
    
    return updatedAlert;
  }
};
