'use client';

import React from 'react';
import { X, Clock, Shield, User, MessageSquare } from 'lucide-react';
import { Incident } from '../types';
import StatusBadge from '@/components/ui/StatusBadge';

interface IncidentDetailProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IncidentDetail({ incident, isOpen, onClose }: IncidentDetailProps) {
  if (!incident) return null;

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l border-zinc-800 bg-zinc-950 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 p-6">
          <div className="flex items-center space-x-4">
            <StatusBadge variant={incident.severity} label={incident.severity.toUpperCase()} />
            <h2 className="text-xl font-bold text-white truncate max-w-xs">{incident.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Incident Intelligence</h3>
            <p className="text-sm leading-relaxed text-zinc-300 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              {incident.description}
            </p>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-800 p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-600">Current Status</span>
              <p className="text-sm font-medium text-white capitalize">{incident.status}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-600">Assigned To</span>
              <p className="text-sm font-medium text-white">{incident.assignee_id ? `Sentinel S-${incident.assignee_id.substring(0,4)}` : 'Unassigned'}</p>
            </div>
          </div>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Mitigation Timeline</h3>
              <button className="flex items-center space-x-2 text-[10px] font-bold uppercase text-blue-500 hover:text-blue-400">
                <Plus size={12} />
                <span>Add Note</span>
              </button>
            </div>

            <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:h-full before:w-px before:bg-zinc-800">
              {[1, 2].map((i) => (
                <div key={i} className="relative pl-10">
                  <div className="absolute left-0 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Status Transformed to {i === 1 ? 'Investigating' : 'Mitigated'}</p>
                    <div className="mt-2 flex items-center space-x-3 text-[10px] text-zinc-500">
                      <span className="flex items-center"><Clock size={10} className="mr-1" /> 2h ago</span>
                      <span className="flex items-center"><User size={10} className="mr-1" /> Sentinel S-ADMIN</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="border-t border-zinc-800 p-6 bg-zinc-900/20">
          <div className="flex items-center space-x-4">
            <button className="flex-1 rounded-xl bg-zinc-100 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-colors">
              Update Status
            </button>
            <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-900">
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Plus } from 'lucide-react';
