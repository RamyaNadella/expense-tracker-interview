import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { makeExpense, makeTestUser } from '../../test-utils';

const useAuthMock = vi.fn();
const useExpensesMock = vi.fn();
const useMonthlyTotalMock = vi.fn();

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('../../../hooks/useExpenses', () => ({
  useExpenses: (...args: unknown[]) => useExpensesMock(...args),
  useMonthlyTotal: (...args: unknown[]) => useMonthlyTotalMock(...args),
  useCreateExpense: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateExpense: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteExpense: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../../../hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      { id: 1, name: 'Food', icon: 'utensils' },
      { id: 2, name: 'Transport', icon: 'car' },
    ],
  }),
}));

import App from '../../../App';

describe('bugs: dashboard expense actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const user = makeTestUser('dashboard_actions');
    useAuthMock.mockReturnValue({
      user,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginError: null,
      registerError: null,
      isLoginPending: false,
      isRegisterPending: false,
    });
  });

  test('dashboard recent expense edit opens edit modal in expenses page', async () => {
    const expenses = [makeExpense({ id: 9, description: 'Needs Edit' })];
    useExpensesMock.mockReturnValue({ data: expenses, isLoading: false });
    useMonthlyTotalMock
      .mockReturnValueOnce({ data: { total: 10, year: 2026, month: 3 }, isLoading: false })
      .mockReturnValueOnce({ data: { total: 5, year: 2026, month: 2 }, isLoading: false });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTitle('Edit'));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Expenses' })).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Edit Expense' })).toBeInTheDocument();
  });
});
