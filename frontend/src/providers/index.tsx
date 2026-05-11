'use client';

import { Toaster } from 'sonner';
import QueryProvider from './QueryProvider';
import { AuthProvider } from '@/features/auth/context/AuthContext';

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </QueryProvider>
    </AuthProvider>
  );
}
