import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type BadgeVariant = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'warning';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  info: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
};

export default function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors',
      variants[variant],
      className
    )}>
      {label}
    </span>
  );
}
