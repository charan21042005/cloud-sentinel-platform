import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/api-client';
import AuditFeed from './AuditFeed';

vi.mock('@/lib/api-client', () => ({ default: { get: vi.fn() } }));

function renderFeed() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuditFeed />
    </QueryClientProvider>,
  );
}

describe('AuditFeed', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state', () => {
    vi.mocked(apiClient.get).mockReturnValue(new Promise(() => {}) as never);
    renderFeed();
    expect(screen.getByRole('status')).toHaveTextContent('Loading audit events');
  });

  it('shows a truthful empty state', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { items: [], has_more: false } } as never);
    renderFeed();
    expect(await screen.findByText('No audit events have been recorded yet.')).toBeInTheDocument();
  });

  it('renders persisted event data', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        has_more: false,
        items: [
          {
            id: 'event-1',
            event_type: 'authentication.login',
            message: 'Login succeeded',
            actor_user_id: '12345678-aaaa',
            outcome: 'success',
            created_at: '2026-01-01T00:00:00Z',
          },
        ],
      },
    } as never);
    renderFeed();
    expect(await screen.findByText('Login succeeded')).toBeInTheDocument();
    expect(screen.getByText('User 12345678')).toBeInTheDocument();
  });

  it('does not invent an outcome for older audit rows', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        has_more: false,
        items: [
          {
            id: 'legacy-event',
            event_type: 'system',
            message: 'Historical event',
            created_at: '2026-01-01T00:00:00Z',
          },
        ],
      },
    } as never);
    renderFeed();
    expect(await screen.findByText('unknown')).toBeInTheDocument();
  });

  it('shows an error instead of fake events', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('unavailable'));
    renderFeed();
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Audit events could not be loaded.'),
    );
  });

  it('explains the admin-only restriction', async () => {
    vi.mocked(apiClient.get).mockRejectedValue({ response: { status: 403 } });
    renderFeed();
    expect(await screen.findByRole('alert')).toHaveTextContent('restricted to administrators');
  });
});
