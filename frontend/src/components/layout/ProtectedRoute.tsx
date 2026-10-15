'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, sessionCheckFailed, retrySessionCheck } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !sessionCheckFailed) {
      router.push(`/auth/login?callbackUrl=${pathname}`);
    }
  }, [isAuthenticated, isLoading, sessionCheckFailed, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-200" />
      </div>
    );
  }

  if (sessionCheckFailed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 p-6 text-center">
        <p className="text-sm text-amber-200">
          Could not verify your session because the API is temporarily unavailable.
        </p>
        <button
          type="button"
          onClick={() => void retrySessionCheck()}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white"
        >
          Retry session check
        </button>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
