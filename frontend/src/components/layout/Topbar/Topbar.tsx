'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  LogOut, 
  ExternalLink,
  Activity
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAlerts } from '@/features/alerts/hooks/useAlerts';
import AlertFeed from '@/features/alerts/components/AlertFeed';

export default function Topbar() {
  const { logout } = useAuth();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: alerts } = useAlerts();
  const unreadCount = alerts?.filter(a => a.status === 'new').length || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAlertOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950 px-8">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
          <Activity className="h-3 w-3" />
          <span>System Normal</span>
        </div>
        <div className="h-4 w-px bg-zinc-800" />
        <h2 className="text-sm font-medium text-zinc-400">Command Center / Overview</h2>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search incidents, nodes..."
            className="h-9 w-64 rounded-full border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center space-x-2 relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsAlertOpen(!isAlertOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
            )}
          </button>

          {/* Alert Dropdown */}
          {isAlertOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
              <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Action Queue</h3>
                <span className="text-[10px] font-mono text-zinc-500">{unreadCount} Pending</span>
              </div>
              <AlertFeed />
            </div>
          )}

          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
            <ExternalLink className="h-5 w-5" />
          </button>
          <div className="h-4 w-px bg-zinc-800 mx-2" />
          <button 
            onClick={logout}
            className="flex items-center space-x-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Secure Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
