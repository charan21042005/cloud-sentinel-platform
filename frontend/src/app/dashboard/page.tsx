import React from 'react';
import { ShieldCheck, BarChart3 } from 'lucide-react';
import MetricsDashboard from '@/features/metrics/components/MetricsDashboard';
import AuditFeed from '@/features/audit/components/AuditFeed';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Platform Overview</h1>
        <p className="mt-2 text-zinc-400">Real-time status of your cloud infrastructure and active sentinel response.</p>
      </div>

      <div className="mt-8">
        <MetricsDashboard />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mt-8">
        <AuditFeed />

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-zinc-700">
            <BarChart3 className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-zinc-400">Threat Intelligence Visualization</h3>
          <p className="mt-2 max-w-[200px] text-xs text-zinc-600">Additional data visualization modules will be activated as metrics stream in.</p>
        </div>
      </div>
    </div>
  );
}
