import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProjectStatusTable from '../ProjectStatusTable';

describe('ProjectStatusTable', () => {
  it('presents the recorded project statuses in a readable semantic table', () => {
    render(<ProjectStatusTable />);

    expect(screen.getByRole('heading', { name: 'Project status' })).toBeInTheDocument();
    expect(screen.getByText(/not a live infrastructure health monitor/i)).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Project areas and their recorded status' });
    expect(within(table).getAllByRole('row')).toHaveLength(7);
    expect(within(table).getByRole('columnheader', { name: 'Area' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Current status' })).toBeInTheDocument();
    expect(
      within(table).getByRole('row', { name: /Local demo Ready based on recorded checks/ }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('row', { name: /Core application Partially verified/ }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('row', {
        name: /Cloud\/DevOps foundation Substantial work completed/,
      }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('row', {
        name: /Monitoring and alerting Needs completion\/verification/,
      }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('row', { name: /Security hardening Outstanding work/ }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('row', { name: /Full production readiness Not established/ }),
    ).toBeInTheDocument();
    expect(table).toHaveClass('table-fixed', 'w-full');
  });
});
