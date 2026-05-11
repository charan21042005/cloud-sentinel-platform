'use client';

import { Toaster } from 'sonner';
import QueryProvider from './QueryProvider';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import GlobalLoadingIndicator from '@/components/layout/GlobalLoadingIndicator';

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryProvider>
          <GlobalLoadingIndicator />
          {children}
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
