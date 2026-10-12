import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Sidebar from './Sidebar';

const state = vi.hoisted(() => ({
  user: null as null | { username: string; role: 'admin' | 'operator' | 'viewer' },
}));

vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard' }));
vi.mock('@/features/auth/context/AuthContext', () => ({ useAuth: () => ({ user: state.user }) }));

describe('Sidebar role navigation', () => {
  beforeEach(() => {
    state.user = null;
  });

  it.each(['viewer', 'operator'] as const)('hides user management from %s users', (role) => {
    state.user = { username: 'sentinel-user', role };
    render(<Sidebar />);
    expect(screen.queryByRole('link', { name: /users/i })).not.toBeInTheDocument();
  });

  it('shows user management only to admins', () => {
    state.user = { username: 'site-admin', role: 'admin' };
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: /users/i })).toHaveAttribute(
      'href',
      '/dashboard/users',
    );
  });
});
