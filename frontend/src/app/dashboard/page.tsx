import React from 'react';
import MetricsDashboard from '@/features/metrics/components/MetricsDashboard';
import AuditFeed from '@/features/audit/components/AuditFeed';
import IncidentAnalytics from '@/features/incidents/components/IncidentAnalytics';
import ProjectStatusTable from '@/features/project-status/components/ProjectStatusTable';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Platform Overview</h1>
        <p className="mt-2 max-w-3xl text-zinc-400">
          Telemetry and project status are shown separately. Recorded project checks are not live
          infrastructure health.
        </p>
      </div>

      <div className="mt-8">
        <MetricsDashboard />
      </div>

      <ProjectStatusTable />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <AuditFeed />

        <IncidentAnalytics />
      </div>
    </div>
  );
}
