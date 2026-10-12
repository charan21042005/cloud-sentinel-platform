'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { User, UserRole } from '@/features/auth/types';
import { ManagedUserInput, usersApi } from '@/features/users/api';

const roleOptions: UserRole[] = ['viewer', 'operator', 'admin'];

function messageFor(error: unknown): string {
  const response = (error as { response?: { status?: number; data?: { detail?: string } } })
    ?.response;
  const status = response?.status;
  if (response?.data?.detail === 'The last active administrator cannot be demoted') {
    return 'The last active administrator cannot be demoted.';
  }
  if (status === 400 || status === 409) return 'That username or email is already in use.';
  if (status === 401) return 'Your session has expired. Sign in again.';
  if (status === 403) return 'Only administrators can manage users.';
  if (status === 422) return 'Check the user details and password requirements.';
  if (!response) return 'Could not reach the API. Check the connection and retry.';
  if (status && status >= 500) return 'The service could not load users. Please retry.';
  return 'The request could not be completed. Please try again.';
}

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, isLoading, refreshUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<ManagedUserInput>({
    username: '',
    email: '',
    password: '',
    role: 'viewer',
  });

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      setUsers(await usersApi.list());
      setError(null);
    } catch (requestError) {
      setError(messageFor(requestError));
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && currentUser?.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    if (isLoading || currentUser?.role !== 'admin') return;

    let active = true;
    usersApi
      .list()
      .then((result) => {
        if (active) {
          setUsers(result);
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (active) setError(messageFor(requestError));
      })
      .finally(() => {
        if (active) setLoadingUsers(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser?.role, isLoading, router]);

  const createUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await usersApi.create(form);
      setForm({ username: '', email: '', password: '', role: 'viewer' });
      setNotice('User created successfully.');
      await loadUsers();
    } catch (requestError) {
      setError(messageFor(requestError));
    } finally {
      setPending(false);
    }
  };

  const changeRole = async (target: User, role: UserRole) => {
    if (target.role === role) return;
    const selfDemotion = target.id === currentUser?.id && role !== 'admin';
    const warning = selfDemotion
      ? 'Changing your own role may remove your user-management access. Continue?'
      : `Change ${target.username}'s role from ${target.role} to ${role}?`;
    if (!window.confirm(warning)) return;

    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await usersApi.updateRole(target.id, role);
      setNotice('Role updated successfully.');
      const refreshed = await refreshUser();
      await loadUsers();
      if (refreshed.role !== 'admin') router.replace('/dashboard');
    } catch (requestError) {
      setError(messageFor(requestError));
    } finally {
      setPending(false);
    }
  };

  if (isLoading || currentUser?.role !== 'admin') {
    return (
      <p className="p-8 text-sm text-zinc-400">
        Administrator access required. Returning to dashboard…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">User management</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Create accounts and assign least-privilege roles.
        </p>
      </header>

      {error && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
          role="alert"
        >
          <span>{error}</span>
          {!loadingUsers && (
            <button
              type="button"
              onClick={() => void loadUsers()}
              className="rounded-md border border-red-300/30 px-3 py-1.5 font-medium hover:bg-red-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200"
            >
              Retry user list
            </button>
          )}
        </div>
      )}
      {notice && (
        <p
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200"
          role="status"
        >
          {notice}
        </p>
      )}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Create user</h2>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={createUser}>
          <label className="text-sm text-zinc-300">
            Username
            <input
              required
              minLength={3}
              maxLength={50}
              autoComplete="username"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Initial password
            <input
              required
              type="password"
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Role
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={pending}
            className="min-h-11 rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-950 disabled:opacity-50 sm:col-span-2"
          >
            {pending ? 'Saving…' : 'Create user'}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Existing users</h2>
        </div>
        {loadingUsers ? (
          <p className="p-6 text-sm text-zinc-400">Loading users…</p>
        ) : error ? null : users.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="text-zinc-400">
                <tr>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((target) => (
                  <tr key={target.id}>
                    <td className="px-6 py-4 text-white">
                      {target.username}
                      {target.id === currentUser.id ? ' (you)' : ''}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{target.email}</td>
                    <td className="px-6 py-4">
                      <select
                        aria-label={`Role for ${target.username}`}
                        value={target.role}
                        disabled={pending}
                        onChange={(event) =>
                          void changeRole(target, event.target.value as UserRole)
                        }
                        className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-white"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {target.is_active ? 'Active' : 'Inactive'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
