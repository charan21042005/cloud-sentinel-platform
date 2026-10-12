import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LoginForm from '../LoginForm';

vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ login: vi.fn() }) }));

describe('LoginForm registration path', () => {
  it('links new users to registration', () => {
    render(<LoginForm />);
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/auth/register',
    );
  });
});
