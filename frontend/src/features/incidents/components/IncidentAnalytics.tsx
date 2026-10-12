'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, ShieldAlert } from 'lucide-react';
import apiClient from '@/lib/api-client';

type Count = { severity?: string; status?: string; date?: string; count: number };
type Analytics = {
  total_incidents: number;
  recent_24h_count: number;
  daily_counts: Count[];
  severity_counts: Count[];
  status_counts: Count[];
};

async function loadAnalytics(): Promise<Analytics> {
  const response = await apiClient.get<Analytics>('/incidents/analytics');
  return response.data;
}

function CountBars({
  title,
  items,
  labelKey,
}: {
  title: string;
  items: Count[];
  labelKey: 'severity' | 'status';
}) {
  const maximum = Math.max(1, ...items.map((item) => item.count));
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold tracking-wider text-zinc-400 uppercase">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-zinc-600">No recorded incidents.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item[labelKey]}>
              <div className="mb-1 flex justify-between text-xs text-zinc-400">
                <span>{item[labelKey]}</span>
                <span>{item.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded bg-zinc-800">
                <div
                  className="h-full rounded bg-cyan-500"
                  style={{ width: `${(item.count / maximum) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function IncidentAnalytics() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['incident-analytics'],
    queryFn: loadAnalytics,
    refetchInterval: 30000,
  });

  return (
    <section
      className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8"
      aria-labelledby="incident-analytics-title"
    >
      <div className="mb-6 flex items-start gap-3 border-b border-zinc-800 pb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h2 id="incident-analytics-title" className="text-lg font-semibold text-white">
            Incident Analytics
          </h2>
          <p className="mt-1 text-xs text-zinc-500">Aggregated from stored incident records</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="text-xs text-zinc-500">Recorded incidents</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {isLoading ? '—' : (data?.total_incidents ?? '—')}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <p className="text-xs text-zinc-500">Triggered · last 24h</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {isLoading ? '—' : (data?.recent_24h_count ?? '—')}
          </p>
        </div>
      </div>

      {isLoading && (
        <p role="status" className="py-5 text-center text-sm text-zinc-400">
          Loading incident analytics…
        </p>
      )}
      {isError && (
        <p role="alert" className="py-5 text-sm text-amber-300">
          Incident analytics are unavailable.
        </p>
      )}
      {!isLoading && !isError && data && data.total_incidents === 0 && (
        <p className="py-5 text-center text-sm text-zinc-500">
          No incident records are available for analytics.
        </p>
      )}
      {!isLoading && !isError && data && data.total_incidents > 0 && (
        <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
          <CountBars
            title="Severity distribution"
            items={data.severity_counts}
            labelKey="severity"
          />
          <CountBars title="Status distribution" items={data.status_counts} labelKey="status" />
          <div className="sm:col-span-2">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Incident triggers by day
            </h3>
            {data.daily_counts.length === 0 ? (
              <p className="text-xs text-zinc-600">No dated records.</p>
            ) : (
              <div className="flex h-24 items-end gap-1" aria-label="Incident counts by date">
                {data.daily_counts.map((point) => {
                  const peak = Math.max(1, ...data.daily_counts.map((sample) => sample.count));
                  return (
                    <div
                      key={point.date}
                      className="group relative flex flex-1 flex-col items-center justify-end"
                      title={`${point.date}: ${point.count}`}
                    >
                      <div
                        className="w-full rounded-t bg-cyan-500/80"
                        style={{ height: `${Math.max(5, (point.count / peak) * 100)}%` }}
                      />
                      <span className="mt-1 hidden text-[9px] text-zinc-600 group-first:inline">
                        {point.date?.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
        Threat intelligence feed not configured. These charts summarize incidents; they are not
        external threat indicators.
      </div>
    </section>
  );
}
