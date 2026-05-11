'use client';

import { useIsFetching } from '@tanstack/react-query';

export default function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();

  if (isFetching === 0) return null;

  return (
    <div className="fixed left-0 top-0 z-[9999] h-[2px] w-full overflow-hidden bg-zinc-900">
      <div className="h-full w-1/3 animate-loading-bar bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
    </div>
  );
}
