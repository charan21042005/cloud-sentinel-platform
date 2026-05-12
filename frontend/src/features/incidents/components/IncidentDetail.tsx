import React from 'react';
import { X, Clock, Shield, User, Layers, ShieldAlert, CheckCircle, Flame, Eye, Terminal } from 'lucide-react';
import { Incident } from '../types';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAcknowledgeIncident, useResolveIncident } from '../hooks/useIncidents';

interface IncidentDetailProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IncidentDetail({ incident, isOpen, onClose }: IncidentDetailProps) {
  const acknowledgeMutation = useAcknowledgeIncident();
  const resolveMutation = useResolveIncident();

  if (!incident) return null;

  const isFiring = incident.status === 'firing';
  const isAcknowledged = incident.status === 'acknowledged';

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl border-l border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex h-full flex-col">
        {/* Superior Status Navigation Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 p-6 bg-zinc-900/20">
          <div className="flex items-center space-x-3 min-w-0">
            <StatusBadge variant={incident.severity} label={incident.severity.toUpperCase()} />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-zinc-100 truncate max-w-md">{incident.title}</h2>
              <p className="text-[11px] font-mono text-zinc-500">Chain Hash: {incident.fingerprint}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Core Forensic Data Drawer */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Action Control Panel */}
          <div className="flex items-center space-x-3 bg-zinc-900/60 p-2 rounded-2xl border border-zinc-800">
            <button 
              onClick={() => acknowledgeMutation.mutate(incident.id)}
              disabled={!isFiring || acknowledgeMutation.isPending}
              className={`flex-1 flex items-center justify-center space-x-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all ${isFiring ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}`}
            >
              <ShieldAlert size={14} />
              <span>{acknowledgeMutation.isPending ? 'Silencing...' : isAcknowledged ? 'Acknowledged' : 'Acknowledge'}</span>
            </button>
            <button 
              onClick={() => resolveMutation.mutate(incident.id)}
              disabled={incident.status === 'resolved' || resolveMutation.isPending}
              className={`flex-1 flex items-center justify-center space-x-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all ${incident.status !== 'resolved' ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}`}
            >
              <CheckCircle size={14} />
              <span>{resolveMutation.isPending ? 'Terminating...' : incident.status === 'resolved' ? 'Resolved' : 'Resolve Incident'}</span>
            </button>
          </div>

          {/* Operational Topology Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/80 p-3.5 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Correlated Pulses</span>
              <p className="text-base font-mono font-bold text-zinc-200">{incident.occurrence_count}</p>
            </div>
            <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/80 p-3.5 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Telemetry Engine</span>
              <p className="text-xs font-semibold text-zinc-300 truncate mt-0.5">{incident.source}</p>
            </div>
            <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/80 p-3.5 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Escalation Tier</span>
              <p className="text-xs font-semibold font-mono text-orange-400 mt-0.5 flex items-center">
                <Flame size={12} className="mr-1 inline text-orange-500" /> Tier {incident.escalation_level}
              </p>
            </div>
          </div>

          {/* Payload Raw Forensics Viewer */}
          {incident.description && (
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center">
                <Terminal size={12} className="mr-1.5" /> Intelligence Context
              </h3>
              <p className="text-xs leading-relaxed text-zinc-400 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 font-mono">
                {incident.description}
              </p>
            </section>
          )}

          {/* Immutable Forensic Timeline Ledger */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center">
              <Clock size={12} className="mr-1.5" /> Forensic Timeline ({incident.events?.length || 0})
            </h3>

            <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:h-full before:w-px before:bg-zinc-800">
              {incident.events?.map((event) => {
                const isTrigger = event.event_type === 'triggered';
                const isAck = event.event_type === 'acknowledged';
                const isRes = event.event_type === 'resolved';

                return (
                  <div key={event.id} className="relative pl-8 transition-all hover:opacity-100">
                    <div className={`absolute left-0 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border ${isTrigger ? 'border-red-500/40 bg-red-950/20' : isAck ? 'border-amber-500/40 bg-amber-950/20' : isRes ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-zinc-800'}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${isTrigger ? 'bg-red-500' : isAck ? 'bg-amber-500' : isRes ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                    </div>
                    <div className="bg-zinc-900/30 border border-zinc-800/60 p-3 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-zinc-200 capitalize">
                          {event.event_type.replace('_', ' ')}
                        </p>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span className="flex items-center font-mono">
                          <User size={10} className="mr-1" /> {event.actor}
                        </span>
                        {event.event_metadata && Object.keys(event.event_metadata).length > 0 && (
                          <span className="text-zinc-600 font-mono truncate max-w-[200px]">
                            {JSON.stringify(event.event_metadata)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
