'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  AlertCircle, 
  BarChart3, 
  Users, 
  Settings, 
  Shield,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/features/auth/context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Incidents', href: '/dashboard/incidents', icon: AlertCircle },
  { name: 'Metrics', href: '/dashboard/metrics', icon: BarChart3 },
  { name: 'Team', href: '/dashboard/users', icon: Users, roles: ['admin'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
            <Shield className="h-5 w-5 text-zinc-950" />
          </div>
          <span className="text-lg font-bold text-white">Sentinel</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-zinc-900 text-white' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn(
                  'mr-3 h-5 w-5 transition-colors',
                  isActive ? 'text-white' : 'text-zinc-500 group-hover:text-white'
                )} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="h-4 w-4 text-zinc-600" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center space-x-3 rounded-lg bg-zinc-900/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
            {user?.username?.substring(0, 2).toUpperCase() || 'S'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-medium text-white">{user?.username}</p>
            <p className="truncate text-[10px] uppercase tracking-tighter text-zinc-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
