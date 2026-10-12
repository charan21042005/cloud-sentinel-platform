'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ShieldCheck, User } from 'lucide-react';
import apiClient from '@/lib/api-client';
import type { AuditEventPage } from '../types';

async function loadAuditEvents(): Promise<AuditEventPage> {
  const response = await apiClient.get<AuditEventPage>('/audit/', { params: { limit: 8 } });
  return response.data;
}

export default function AuditFeed() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['audit-events', 8],
    queryFn: loadAuditEvents,
    refetchInterval: 15000,
  });

  const status = (error as { response?: { status?: number } } | null)?.response?.status;

  return (
    <section
      className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8"
      aria-labelledby="audit-title"
    >
      <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
          <h2 id="audit-title" className="text-lg font-semibold text-white">
            Platform Audit Log
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Persisted application events · administrator access
          </p>
        </div>
        <ShieldCheck className="h-5 w-5 text-emerald-400" aria-hidden="true" />
      </div>

      {isLoading && (
        <p role="status" className="py-8 text-center text-sm text-zinc-400">
          Loading audit events…
        </p>
      )}
      {isError && (
        <div role="alert" className="flex items-center gap-2 py-8 text-sm text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {status === 403
            ? 'Audit events are restricted to administrators.'
            : 'Audit events could not be loaded.'}
        </div>
      )}
      {!isLoading && !isError && data?.items.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500">
          No audit events have been recorded yet.
        </p>
      )}
      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="flex-1 space-y-3 overflow-y-auto pr-2" aria-label="Recent audit events">
          {data.items.map((event) => (
            <article
              key={event.id}
              className="flex items-start gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                {event.event_type.startsWith('authentication') ? (
                  <User className="h-4 w-4 text-blue-400" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{event.message}</p>
                <p className="mt-1 text-[10px] tracking-wider text-zinc-500 uppercase">
                  {event.actor_user_id
                    ? `User ${event.actor_user_id.slice(0, 8)}`
                    : 'System / unknown actor'}
                  {event.target_type && (
                    <span>
                      {' '}
                      · {event.target_type}
                      {event.target_id ? ` ${event.target_id.slice(0, 8)}` : ''}
                    </span>
                  )}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={
                    event.outcome === 'success'
                      ? 'text-[10px] text-emerald-400'
                      : event.outcome === 'failure'
                        ? 'text-[10px] text-rose-400'
                        : 'text-[10px] text-zinc-500'
                  }
                >
                  {event.outcome ?? 'unknown'}
                </span>
                <time className="mt-1 block text-[10px] text-zinc-600" dateTime={event.created_at}>
                  {new Date(event.created_at).toLocaleString([], {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
