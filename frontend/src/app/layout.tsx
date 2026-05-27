import type { Metadata } from 'next';
import AppProvider from '@/providers';
import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Cloud Sentinel Monitoring and Observabiliy | Platform',
  description: 'Enterprise-grade cloud observability and incident management platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="flex min-h-full flex-col bg-zinc-950 text-zinc-50">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
