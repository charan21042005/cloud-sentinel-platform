import React from 'react';
import { 
  AlertTriangle, 
  Activity, 
  Users, 
  Clock,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

const stats = [
  { name: 'Active Incidents', value: '12', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  { name: 'System Health', value: '99.9%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { name: 'Active Sentinels', value: '4', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Avg. Response Time', value: '4.2m', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Platform Overview</h1>
        <p className="mt-2 text-zinc-400">Real-time status of your cloud infrastructure and active sentinel response.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className={stat.bg + " p-3 rounded-xl " + stat.color}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="flex items-center text-xs font-medium text-zinc-500">
                +12.5% <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">{stat.name}</p>
              <h3 className="mt-1 text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
            <h3 className="text-lg font-semibold text-white">Recent Security Audits</h3>
            <button className="text-xs font-medium text-zinc-400 hover:text-white">View Full Logs</button>
          </div>
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 rounded-xl border border-zinc-800/50 bg-zinc-950/50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <ShieldCheck className="h-5 w-5 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">IAM Permission Audit Complete</p>
                  <p className="text-xs text-zinc-500">Production Node Cluster 0{i}</p>
                </div>
                <span className="text-[10px] font-medium text-zinc-600">2h ago</span>
              </div>
            ))}
          </div>
        </div>

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

import { BarChart3 } from 'lucide-react';
