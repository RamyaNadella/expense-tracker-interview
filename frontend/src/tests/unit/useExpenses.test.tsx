import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createTestQueryClient } from '../test-utils';

vi.mock('../../api/expenses', () => ({
  getExpenses: vi.fn().mockResolvedValue([]),
  getExpense: vi.fn(),
  getMonthlyTotal: vi.fn(),
  createExpense: vi.fn().mockResolvedValue({}),
  updateExpense: vi.fn().mockResolvedValue({}),
  deleteExpense: vi.fn().mockResolvedValue(undefined),
}));

import * as expensesApi from '../../api/expenses';
import { useCreateExpense } from '../../hooks/useExpenses';

describe('useExpenses mutation invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('create invalidates expenses and monthly-total queries', async () => {
    const queryClient = createTestQueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateExpense(), { wrapper });
    act(() => {
      result.current.mutate({
        categoryId: 1,
        amount: 12,
        description: 'Coffee',
        date: '2026-03-01',
      });
    });

    await waitFor(() => expect(expensesApi.createExpense).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith({ queryKey: ['expenses'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['monthly-total'] });
  });
});
