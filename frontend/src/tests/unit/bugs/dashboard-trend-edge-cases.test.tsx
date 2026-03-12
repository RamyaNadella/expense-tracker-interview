import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { makeExpense } from '../../test-utils';

const useExpensesMock = vi.fn();
const useMonthlyTotalMock = vi.fn();

vi.mock('../../../hooks/useExpenses', () => ({
  useExpenses: (...args: unknown[]) => useExpensesMock(...args),
  useMonthlyTotal: (...args: unknown[]) => useMonthlyTotalMock(...args),
}));

import { Dashboard } from '../../../pages/Dashboard';

describe('bugs: dashboard trend edge cases', () => {
  test('shows explicit trend text for zero-vs-zero month state', () => {
    useExpensesMock.mockReturnValue({ data: [], isLoading: false });
    useMonthlyTotalMock
      .mockReturnValueOnce({ data: { total: 0, year: 2026, month: 3 }, isLoading: false })
      .mockReturnValueOnce({ data: { total: 0, year: 2026, month: 2 }, isLoading: false });

    render(<Dashboard onEditExpense={vi.fn()} />);
    expect(screen.getByText(/0.0% vs last month/i)).toBeInTheDocument();
  });

  test('caps extreme percent change for tiny previous month totals', () => {
    useExpensesMock.mockReturnValue({
      data: [makeExpense({ amount: 100, description: 'Spike' })],
      isLoading: false,
    });
    useMonthlyTotalMock
      .mockReturnValueOnce({ data: { total: 100, year: 2026, month: 3 }, isLoading: false })
      .mockReturnValueOnce({ data: { total: 0.01, year: 2026, month: 2 }, isLoading: false });

    render(<Dashboard onEditExpense={vi.fn()} />);
    expect(screen.queryByText(/999900.0% vs last month/i)).not.toBeInTheDocument();
  });
});
