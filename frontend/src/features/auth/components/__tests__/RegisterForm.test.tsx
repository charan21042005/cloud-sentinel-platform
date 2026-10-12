import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterForm from '../RegisterForm';
import { authApi } from '../../api';

vi.mock('../../api', () => ({
  authApi: { register: vi.fn() },
}));

function fillForm(options: { password?: string; confirmPassword?: string } = {}) {
  const password = options.password ?? 'strong-pass-123';
  const confirmPassword = options.confirmPassword ?? password;
  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'sentinel-viewer' } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'sentinel@example.test' } });
  fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/confirm password/i), {
    target: { value: confirmPassword },
  });
}

describe('RegisterForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the required fields and login link', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/username/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/^password/i)).toBeRequired();
    expect(screen.getByLabelText(/confirm password/i)).toBeRequired();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/auth/login');
  });

  it('toggles password visibility accessibly', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/^password/i)).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByLabelText(/^password/i)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(screen.getByLabelText(/^password/i)).toHaveAttribute('type', 'password');
  });

  it('validates password confirmation and does not call the API on mismatch', async () => {
    render(<RegisterForm />);
    fillForm({ confirmPassword: 'different-password' });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('validates email format and the backend password minimum', async () => {
    render(<RegisterForm />);
    fillForm({ password: 'short' });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('sends only the backend fields and shows a login link after success', async () => {
    vi.mocked(authApi.register).mockResolvedValue({} as never);
    render(<RegisterForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() =>
      expect(authApi.register).toHaveBeenCalledWith({
        username: 'sentinel-viewer',
        email: 'sentinel@example.test',
        password: 'strong-pass-123',
      }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Registration complete');
    expect(screen.getByRole('link', { name: 'Continue to sign in' })).toHaveAttribute(
      'href',
      '/auth/login',
    );
  });

  it('maps duplicate-account errors without rendering raw API details', async () => {
    vi.mocked(authApi.register).mockRejectedValue({
      response: { status: 400, data: { detail: 'internal detail' } },
    });
    render(<RegisterForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/already registered/i);
    expect(screen.queryByText('internal detail')).not.toBeInTheDocument();
  });

  it('shows a safe network error and prevents duplicate submissions while pending', async () => {
    let resolveRegistration!: (value: never) => void;
    vi.mocked(authApi.register).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegistration = resolve;
        }),
    );
    render(<RegisterForm />);
    fillForm();
    const submit = screen.getByRole('button', { name: 'Create account' });
    fireEvent.click(submit);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled(),
    );
    fireEvent.click(screen.getByRole('button', { name: /creating account/i }));
    expect(authApi.register).toHaveBeenCalledTimes(1);
    resolveRegistration({} as never);
    expect(await screen.findByRole('status')).toHaveTextContent('Registration complete');

    vi.mocked(authApi.register).mockRejectedValueOnce(new Error('network unavailable'));
    render(<RegisterForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to reach/i);
  });
});
