import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UsersPage from './page';
import { usersApi } from '@/features/users/api';
import type { User } from '@/features/auth/types';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  auth: {
    user: null as null | {
      id: string;
      username: string;
      email: string;
      role: 'admin' | 'operator' | 'viewer';
      is_active: boolean;
    },
    isLoading: false,
    refreshUser: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock('@/features/auth/context/AuthContext', () => ({ useAuth: () => mocks.auth }));
vi.mock('@/features/users/api', () => ({
  usersApi: { list: vi.fn(), create: vi.fn(), updateRole: vi.fn() },
}));

const admin: User = {
  id: 'admin-id',
  username: 'site-admin',
  email: 'admin@example.test',
  role: 'admin',
  is_active: true,
};

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.user = admin;
    mocks.auth.isLoading = false;
    mocks.auth.refreshUser.mockResolvedValue(admin);
    vi.mocked(usersApi.list).mockResolvedValue([admin]);
    vi.mocked(usersApi.create).mockResolvedValue({ ...admin, id: 'created-id' });
    vi.mocked(usersApi.updateRole).mockResolvedValue({ ...admin, role: 'operator' });
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    );
  });

  it('redirects non-admin users without requesting user data', async () => {
    mocks.auth.user = { ...admin, role: 'viewer' };
    render(<UsersPage />);
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/dashboard'));
    expect(usersApi.list).not.toHaveBeenCalled();
    expect(screen.getByText(/administrator access required/i)).toBeInTheDocument();
  });

  it('lets an admin create a selected role and renders user-safe fields', async () => {
    render(<UsersPage />);
    expect(await screen.findByText(/site-admin/)).toBeInTheDocument();
    expect(screen.queryByText(/hashed_password/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'new-operator' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'operator@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Initial password'), {
      target: { value: 'synthetic-initial-password' },
    });
    fireEvent.change(screen.getByLabelText('Role', { selector: 'select' }), {
      target: { value: 'operator' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create user' }));

    await waitFor(() =>
      expect(usersApi.create).toHaveBeenCalledWith({
        username: 'new-operator',
        email: 'operator@example.test',
        password: 'synthetic-initial-password',
        role: 'operator',
      }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('User created successfully.');
  });

  it('refreshes the current role after a confirmed self-role change', async () => {
    mocks.auth.refreshUser.mockResolvedValue({ ...admin, role: 'operator' });
    render(<UsersPage />);
    const select = await screen.findByRole('combobox', { name: 'Role for site-admin' });
    fireEvent.change(select, { target: { value: 'operator' } });
    await waitFor(() => expect(usersApi.updateRole).toHaveBeenCalledWith('admin-id', 'operator'));
    expect(mocks.auth.refreshUser).toHaveBeenCalledOnce();
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/dashboard'));
  });
});
