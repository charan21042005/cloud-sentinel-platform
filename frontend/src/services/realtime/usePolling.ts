import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

interface PollingOptions<TData, TError> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  intervalMs?: number;
  pauseWhenHidden?: boolean;
}

/**
 * A hardened polling abstraction over React Query.
 * Designed for metrics and telemetry data that requires continuous updating.
 */
export function usePolling<TData, TError = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options: PollingOptions<TData, TError> = {}
): UseQueryResult<TData, TError> {
  const { intervalMs = 5000, pauseWhenHidden = true, ...restOptions } = options;

  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    refetchInterval: intervalMs,
    // Automatically pause polling if the window loses focus to save server resources
    refetchIntervalInBackground: !pauseWhenHidden,
    refetchOnWindowFocus: true,
    // Add a slight retry delay to prevent hammering the server during brief outages
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...restOptions,
  });
}
