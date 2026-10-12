import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MetricsDashboard from '../MetricsDashboard';
import * as useMetricsHook from '../../hooks/useMetrics';

// Mock recharts responsive container for jsdom
vi.mock('recharts', async () => {
  const original = await vi.importActual<any>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div style={{ width: 400, height: 200 }}>{children}</div>,
  };
});

describe('MetricsDashboard Component', () => {
  it('renders PROMETHEUS (LIVE) source badge when source is prometheus', () => {
    vi.spyOn(useMetricsHook, 'useSystemMetrics').mockReturnValue({
      data: {
        source: 'prometheus',
        cpu_usage: 24.5,
        memory_usage: 62.1,
        active_requests: 120,
        latency_ms: 18.2,
        history: {
          cpu: [{ timestamp: '2026-10-11T05:00:00Z', value: 24.5 }],
          memory: [{ timestamp: '2026-10-11T05:00:00Z', value: 62.1 }],
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

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
        active_requests: 65,
        latency_ms: 22.0,
        history: {
          cpu: [
            { timestamp: '2026-10-11T05:00:00Z', value: 44.0 },
            { timestamp: '2026-10-11T05:00:15Z', value: 45.0 },
          ],
          memory: [
            { timestamp: '2026-10-11T05:00:00Z', value: 54.0 },
            { timestamp: '2026-10-11T05:00:15Z', value: 55.0 },
          ],
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

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
        active_requests: 1,
        latency_ms: 2.0,
        history: { cpu: [], memory: [] },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<MetricsDashboard />);

    expect(screen.getByTestId('telemetry-source-badge')).toHaveTextContent('SOURCE UNKNOWN');
  });

  it('handles empty histories gracefully without crashing', () => {
    vi.spyOn(useMetricsHook, 'useSystemMetrics').mockReturnValue({
      data: {
        source: 'simulated',
        cpu_usage: 0,
        memory_usage: 0,
        active_requests: 0,
        latency_ms: 0,
        history: {
          cpu: [],
          memory: [],
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<MetricsDashboard />);

    expect(screen.getAllByText('No historical data points available').length).toBeGreaterThan(0);
  });

  it('renders error state when telemetry fetch fails', () => {
    vi.spyOn(useMetricsHook, 'useSystemMetrics').mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Network error'),
      refetch: vi.fn(),
    } as any);

    render(<MetricsDashboard />);

    expect(screen.getByText(/Failed to stream telemetry data/i)).toBeInTheDocument();
  });
});
