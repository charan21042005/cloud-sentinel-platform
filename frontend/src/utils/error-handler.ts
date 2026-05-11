import { toast } from 'sonner';

export interface SentinelError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export function normalizeError(error: any): SentinelError {
  // Handle Axios Errors
  if (error.response) {
    const data = error.response.data;
    return {
      message: data.detail || data.message || 'An unexpected server error occurred.',
      status: error.response.status,
      code: data.code,
      details: data.errors,
    };
  }

  // Handle Network Errors
  if (error.request) {
    return {
      message: 'Sentinel could not reach the backend. Check your connectivity.',
      status: 0,
      code: 'NETWORK_ERROR',
    };
  }

  // Handle Internal JS Errors
  return {
    message: error.message || 'A critical frontend error occurred.',
    code: 'CLIENT_ERROR',
  };
}

export function handleGlobalError(error: any) {
  const normalized = normalizeError(error);
  toast.error(normalized.message);
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[Sentinel Error Trace]:', normalized);
  }
}
