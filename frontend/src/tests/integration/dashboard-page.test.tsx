import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { makeExpense } from '../test-utils';

const useExpensesMock = vi.fn();
const useMonthlyTotalMock = vi.fn();

vi.mock('../../hooks/useExpenses', () => ({
  useExpenses: (...args: unknown[]) => useExpensesMock(...args),
  useMonthlyTotal: (...args: unknown[]) => useMonthlyTotalMock(...args),
}));

import { Dashboard } from '../../pages/Dashboard';

describe('Dashboard page', () => {
  test('shows loading state before data loads', () => {
    useExpensesMock.mockReturnValue({ data: undefined, isLoading: true });
    useMonthlyTotalMock.mockReturnValue({ data: undefined, isLoading: true });

    render(<Dashboard onEditExpense={vi.fn()} />);
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  test('renders summary and recent expenses from loaded data', () => {
    const expenses = [
      makeExpense({ id: 1, amount: 10, description: 'Coffee', categoryName: 'Food' }),
      makeExpense({ id: 2, amount: 20, description: 'Taxi', categoryName: 'Transport' }),
    ];
    useExpensesMock.mockReturnValue({ data: expenses, isLoading: false });
    useMonthlyTotalMock
      .mockReturnValueOnce({ data: { total: 30, year: 2026, month: 3 }, isLoading: false })
      .mockReturnValueOnce({ data: { total: 10, year: 2026, month: 2 }, isLoading: false });

    render(<Dashboard onEditExpense={vi.fn()} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('$30.00')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$15.00')).toBeInTheDocument();
    expect(screen.getByText('Coffee')).toBeInTheDocument();
    expect(screen.getByText('Taxi')).toBeInTheDocument();
  });

  test('renders safe empty state and no NaN/Infinity with zero previous month', () => {
    useExpensesMock.mockReturnValue({ data: [], isLoading: false });
    useMonthlyTotalMock
      .mockReturnValueOnce({ data: { total: 0, year: 2026, month: 3 }, isLoading: false })
      .mockReturnValueOnce({ data: { total: 0, year: 2026, month: 2 }, isLoading: false });

    const { container } = render(<Dashboard onEditExpense={vi.fn()} />);
    expect(screen.getByText('No expenses found. Add your first expense!')).toBeInTheDocument();
    expect(container.textContent).not.toContain('NaN');
    expect(container.textContent).not.toContain('Infinity');
  });
});
