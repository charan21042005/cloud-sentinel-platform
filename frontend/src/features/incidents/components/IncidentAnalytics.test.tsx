import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/api-client';
import IncidentAnalytics from './IncidentAnalytics';

vi.mock('@/lib/api-client', () => ({ default: { get: vi.fn() } }));

function renderPanel() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <IncidentAnalytics />
    </QueryClientProvider>,
  );
}

describe('IncidentAnalytics', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading and identifies the missing external feed', () => {
    vi.mocked(apiClient.get).mockReturnValue(new Promise(() => {}) as never);
    renderPanel();
    expect(screen.getByRole('status')).toHaveTextContent('Loading incident analytics');
    expect(screen.getByText(/Threat intelligence feed not configured/)).toBeInTheDocument();
  });

  it('shows an honest empty state for an empty database result', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        total_incidents: 0,
        recent_24h_count: 0,
        daily_counts: [],
        severity_counts: [],
        status_counts: [],
      },
    } as never);
    renderPanel();
    expect(
      await screen.findByText('No incident records are available for analytics.'),
    ).toBeInTheDocument();
  });

  it('renders persisted aggregate counts', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        total_incidents: 4,
        recent_24h_count: 2,
        daily_counts: [{ date: '2026-10-01', count: 4 }],
        severity_counts: [{ severity: 'high', count: 3 }],
        status_counts: [{ status: 'firing', count: 4 }],
      },
    } as never);
    renderPanel();
    expect(await screen.findByText('high')).toBeInTheDocument();
    expect(screen.getByText('firing')).toBeInTheDocument();
    expect(screen.getByText('4', { selector: 'p' })).toBeInTheDocument();
  });

  it('shows an error state when analytics cannot load', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('unavailable'));
    renderPanel();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Incident analytics are unavailable.',
    );
  });
});
