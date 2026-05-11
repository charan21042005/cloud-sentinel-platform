import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  children?: React.ReactNode;
  className?: string;
}

export default function MetricCard({ title, value, icon: Icon, trend, children, className }: MetricCardProps) {
  return (
    <div className={cn("flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm overflow-hidden", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wide text-zinc-400">{title}</h3>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      
      <div className="flex items-baseline space-x-3">
        <span className="text-3xl font-bold text-white">{value}</span>
        {trend && (
          <span className={cn(
            "text-xs font-semibold",
            trend.isPositive ? "text-emerald-500" : "text-red-500"
          )}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {children && (
        <div className="mt-6 flex-1 w-full min-h-[120px]">
          {children}
        </div>
      )}
    </div>
  );
}
