import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const useExpensesMock = vi.fn();

vi.mock('../../../hooks/useExpenses', () => ({
  useExpenses: (...args: unknown[]) => useExpensesMock(...args),
  useCreateExpense: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateExpense: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteExpense: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../../../hooks/useCategories', () => ({
  useCategories: () => ({
    data: [{ id: 1, name: 'Food', icon: 'utensils' }],
  }),
}));

import { Expenses } from '../../../pages/Expenses';

describe('bugs: expenses date filter validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useExpensesMock.mockReturnValue({ data: [], isLoading: false });
  });

  test('does not submit invalid custom range where To is before From', () => {
    render(<Expenses />);

    fireEvent.click(screen.getByRole('button', { name: 'Custom' }));
    fireEvent.change(screen.getByLabelText('From:'), { target: { value: '2026-03-20' } });
    fireEvent.change(screen.getByLabelText('To:'), { target: { value: '2026-03-01' } });

    const latestCall = useExpensesMock.mock.calls.at(-1)?.[0];
    expect(latestCall?.startDate && latestCall?.endDate && latestCall.startDate > latestCall.endDate).toBe(
      false
    );
  });
});
