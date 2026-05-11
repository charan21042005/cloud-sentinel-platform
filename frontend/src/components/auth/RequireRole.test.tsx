import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RequireRole from './RequireRole';
import * as useRoleHook from '@/hooks/useRole';

// Mock the useRole hook
vi.mock('@/hooks/useRole', () => ({
  useRole: vi.fn(),
}));

describe('RequireRole Component', () => {
  const setupMock = (hasRole: boolean) => {
    vi.spyOn(useRoleHook, 'useRole').mockReturnValue({
      role: hasRole ? 'admin' : 'viewer',
      hasRole: () => hasRole,
      isExactly: () => false,
      isAuthenticated: true,
    });
  };

  it('renders children when user has required role clearance', () => {
    setupMock(true);
    render(
      <RequireRole role="analyst">
        <div data-testid="protected-content">Secret Tactical Data</div>
      </RequireRole>
    );
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('hides children entirely when fallback is "hidden"', () => {
    setupMock(false);
    render(
      <RequireRole role="analyst" fallback="hidden">
        <div data-testid="hidden-content">Should Not Render</div>
      </RequireRole>
    );
    expect(screen.queryByTestId('hidden-content')).not.toBeInTheDocument();
  });

  it('renders disabled container when fallback is "disabled"', () => {
    setupMock(false);
    render(
      <RequireRole role="analyst" fallback="disabled">
        <button data-testid="disabled-btn">Launch Nuke</button>
      </RequireRole>
    );
    const container = screen.getByTestId('disabled-btn').parentElement;
    expect(container).toHaveClass('opacity-50 pointer-events-none cursor-not-allowed filter grayscale');
  });

  it('renders a loud Clearance Denied alert when fallback is "alert"', () => {
    setupMock(false);
    render(
      <RequireRole role="admin" fallback="alert">
        <div>Admin Dashboard</div>
      </RequireRole>
    );
    expect(screen.getByText('Clearance Denied')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });
});
