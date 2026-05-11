import React from 'react';
import { LucideIcon, Ghost } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ 
  icon: Icon = Ghost, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-300">{title}</h3>
      <p className="mt-2 text-xs text-zinc-500 max-w-[250px] leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
