import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MetricsDashboard from '../MetricsDashboard';
import * as useMetricsHook from '../../hooks/useMetrics';

// Mock recharts responsive container for jsdom
vi.mock('recharts', async () => {
  const original = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div style={{ width: 400, height: 200 }}>{children}</div>,
  };
});

describe('MetricsDashboard Component', () => {
  const recentTimestamp = new Date().toISOString();

  it('renders PROMETHEUS (LIVE) source badge when source is prometheus', () => {
    vi.spyOn(useMetricsHook, 'useSystemMetrics').mockReturnValue({
      data: {
        source: 'prometheus',
        cpu_usage: 24.5,
        memory_usage: 62.1,
        request_rate_per_second: 1.2,
        latency_ms: 18.2,
        metric_timestamps: { cpu_usage: recentTimestamp, memory_usage: recentTimestamp, request_rate_per_second: recentTimestamp, latency_ms: recentTimestamp },
        source_reachable: true,
        source_checked_at: recentTimestamp,
        history: {
          cpu: [{ timestamp: recentTimestamp, value: 24.5 }],
          memory: [{ timestamp: recentTimestamp, value: 62.1 }],
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMetricsHook.useSystemMetrics>);

    render(<MetricsDashboard />);

    const badge = screen.getByTestId('telemetry-source-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('PROMETHEUS (LIVE)');
    expect(screen.getByText('24.5%')).toBeInTheDocument();
    expect(screen.getByText('62.1%')).toBeInTheDocument();
  });

  it('renders SIMULATED (DEMO FALLBACK) badge when source is simulated', () => {
    vi.spyOn(useMetricsHook, 'useSystemMetrics').mockReturnValue({
      data: {
        source: 'simulated',
        cpu_usage: 45.0,
        memory_usage: 55.0,
        request_rate_per_second: 65,
        latency_ms: 22.0,
        metric_timestamps: { cpu_usage: recentTimestamp, memory_usage: recentTimestamp },
        history: {
          cpu: [
            { timestamp: recentTimestamp, value: 44.0 },
            { timestamp: recentTimestamp, value: 45.0 },
          ],
          memory: [
            { timestamp: recentTimestamp, value: 54.0 },
            { timestamp: recentTimestamp, value: 55.0 },
          ],
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMetricsHook.useSystemMetrics>);

    render(<MetricsDashboard />);

    const badge = screen.getByTestId('telemetry-source-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('SIMULATED (DEMO FALLBACK)');
  });

  it('does not guess a telemetry source when the API omits it', () => {
    vi.spyOn(useMetricsHook, 'useSystemMetrics').mockReturnValue({
      data: {
        cpu_usage: 20.0,
        memory_usage: 30.0,
        request_rate_per_second: 1,
        latency_ms: 2.0,
        history: { cpu: [], memory: [] },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMetricsHook.useSystemMetrics>);

    render(<MetricsDashboard />);

    expect(screen.getByTestId('telemetry-source-badge')).toHaveTextContent('SOURCE UNKNOWN');
  });

  it('handles empty histories gracefully without crashing', () => {
    vi.spyOn(useMetricsHook, 'useSystemMetrics').mockReturnValue({
      data: {
        source: 'simulated',
        cpu_usage: 0,
        memory_usage: 0,
        request_rate_per_second: null,
        latency_ms: 0,
        metric_timestamps: { cpu_usage: recentTimestamp, memory_usage: recentTimestamp },
        history: {
          cpu: [],
          memory: [],
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMetricsHook.useSystemMetrics>);

    render(<MetricsDashboard />);

    expect(screen.getAllByText('Waiting for timestamped telemetry samples').length).toBeGreaterThan(0);
  });

  it('shows unavailable for missing metrics and labels old samples stale', () => {
    vi.spyOn(useMetricsHook, 'useSystemMetrics').mockReturnValue({
      data: {
        source: 'prometheus',
        cpu_usage: null,
        memory_usage: null,
        request_rate_per_second: null,
        latency_ms: null,
        metric_timestamps: {
          cpu_usage: new Date(Date.now() - 60_000).toISOString(),
          memory_usage: new Date(Date.now() - 60_000).toISOString(),
        },
        source_reachable: true,
        source_checked_at: recentTimestamp,
        history: {
          cpu: [{ timestamp: new Date(Date.now() - 60_000).toISOString(), value: 20 }],
          memory: [{ timestamp: new Date(Date.now() - 60_000).toISOString(), value: 30 }],
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMetricsHook.useSystemMetrics>);

    render(<MetricsDashboard />);

    expect(screen.getByTestId('telemetry-source-badge')).toHaveTextContent('PROMETHEUS (STALE)');
    expect(screen.getAllByText('Unavailable')).toHaveLength(4);
    expect(screen.getAllByText('Telemetry samples are stale. Showing the last collected data.')).toHaveLength(2);
  });

  it('evaluates current metric freshness independently', () => {
    vi.spyOn(useMetricsHook, 'useSystemMetrics').mockReturnValue({
      data: {
        source: 'prometheus',
        cpu_usage: 24.5,
        memory_usage: 62.1,
        request_rate_per_second: null,
        latency_ms: 18.2,
        metric_timestamps: {
          cpu_usage: recentTimestamp,
          memory_usage: new Date(Date.now() - 60_000).toISOString(),
          request_rate_per_second: null,
          latency_ms: recentTimestamp,
        },
        source_reachable: true,
        source_checked_at: recentTimestamp,
        history: {
          cpu: [{ timestamp: recentTimestamp, value: 24.5 }],
          memory: [{ timestamp: recentTimestamp, value: 62.1 }],
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMetricsHook.useSystemMetrics>);

    render(<MetricsDashboard />);

    expect(screen.getByText('24.5%')).toBeInTheDocument();
    expect(screen.getAllByText('Unavailable')).toHaveLength(2);
    expect(screen.getAllByText('Current sample is stale.')).toHaveLength(1);
    expect(screen.queryByText('Historical memory samples are stale.')).not.toBeInTheDocument();
    expect(screen.getByTestId('telemetry-source-badge')).toHaveTextContent('PROMETHEUS (PARTIAL)');
  });

  it('does not report LIVE when current metrics are fresh but graph history is stale', () => {
    const oldTimestamp = new Date(Date.now() - 60_000).toISOString();
    vi.spyOn(useMetricsHook, 'useSystemMetrics').mockReturnValue({
      data: {
        source: 'prometheus',
        cpu_usage: 24.5,
        memory_usage: 62.1,
        request_rate_per_second: 1.2,
        latency_ms: 18.2,
        metric_timestamps: {
          cpu_usage: recentTimestamp,
          memory_usage: recentTimestamp,
          request_rate_per_second: recentTimestamp,
          latency_ms: recentTimestamp,
        },
        source_reachable: true,
        source_checked_at: recentTimestamp,
        history: {
          cpu: [{ timestamp: oldTimestamp, value: 24.5 }],
          memory: [{ timestamp: oldTimestamp, value: 62.1 }],
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMetricsHook.useSystemMetrics>);

    render(<MetricsDashboard />);

    expect(screen.getByTestId('telemetry-source-badge')).toHaveTextContent('PROMETHEUS (PARTIAL)');
    expect(screen.getByTestId('telemetry-connectivity')).toHaveTextContent('Prometheus reachable');
    expect(screen.getAllByText('Telemetry samples are stale. Showing the last collected data.')).toHaveLength(2);
  });

  it('marks Prometheus disconnected separately from sample freshness', () => {
    vi.spyOn(useMetricsHook, 'useSystemMetrics').mockReturnValue({
      data: {
        source: 'prometheus',
        cpu_usage: 24.5,
        memory_usage: 62.1,
        request_rate_per_second: 1.2,
        latency_ms: 18.2,
        metric_timestamps: {
          cpu_usage: recentTimestamp,
          memory_usage: recentTimestamp,
          request_rate_per_second: recentTimestamp,
          latency_ms: recentTimestamp,
        },
        source_reachable: false,
        source_checked_at: recentTimestamp,
        history: {
          cpu: [{ timestamp: recentTimestamp, value: 24.5 }],
          memory: [{ timestamp: recentTimestamp, value: 62.1 }],
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMetricsHook.useSystemMetrics>);

    render(<MetricsDashboard />);

    expect(screen.getByTestId('telemetry-source-badge')).toHaveTextContent('PROMETHEUS (DISCONNECTED)');
    expect(screen.getByTestId('telemetry-connectivity')).toHaveTextContent('Prometheus unreachable');
  });

  it('renders error state when telemetry fetch fails', () => {
    vi.spyOn(useMetricsHook, 'useSystemMetrics').mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Network error'),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMetricsHook.useSystemMetrics>);

    render(<MetricsDashboard />);

    expect(screen.getByText(/Failed to stream telemetry data/i)).toBeInTheDocument();
  });
});
