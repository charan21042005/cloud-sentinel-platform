export type AlertSeverity = 'critical' | 'high' | 'warning' | 'info';
export type AlertStatus = 'new' | 'acknowledged' | 'escalated' | 'resolved';

export interface PlatformAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  timestamp: string;
  source: string; // e.g., 'Kubernetes', 'Prometheus', 'AWS IAM'
}
