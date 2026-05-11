'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🛡️ [Sentinel Critical UI Error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 px-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <AlertOctagon className="h-10 w-10" />
          </div>
          
          <h1 className="mt-8 text-2xl font-bold text-white">Interface Circuit Breaker Tripped</h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            A critical UI exception was detected. The Sentinel Interface has safely isolated the error to prevent platform-wide instability.
          </p>

          <div className="mt-10 flex space-x-4">
            <button
              onClick={this.handleReset}
              className="flex items-center space-x-2 rounded-lg bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Restore Interface</span>
            </button>
            <a
              href="/dashboard"
              className="flex items-center space-x-2 rounded-lg border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              <Home className="h-4 w-4" />
              <span>Back to Overview</span>
            </a>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-12 w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 text-left">
              <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Debug Intelligence
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs text-red-400">
                {this.state.error?.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
