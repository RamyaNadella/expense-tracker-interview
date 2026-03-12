import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { makeExpense } from '../test-utils';

let expensesData: ReturnType<typeof makeExpense>[] = [];
let isLoading = false;

const createMutate = vi.fn();
const updateMutate = vi.fn();
const deleteMutate = vi.fn();

vi.mock('../../hooks/useExpenses', () => ({
  useExpenses: () => ({ data: expensesData, isLoading }),
  useCreateExpense: () => ({ mutate: createMutate, isPending: false }),
  useUpdateExpense: () => ({ mutate: updateMutate, isPending: false }),
  useDeleteExpense: () => ({ mutate: deleteMutate, isPending: false }),
}));

vi.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      { id: 1, name: 'Food', icon: 'utensils' },
      { id: 2, name: 'Transport', icon: 'car' },
    ],
  }),
}));

import { Expenses } from '../../pages/Expenses';

describe('Expenses page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    expensesData = [];
    isLoading = false;

    createMutate.mockImplementation((data, options) => {
      expensesData = [makeExpense({ id: Date.now(), ...data as object }), ...expensesData];
      options?.onSuccess?.();
    });
    updateMutate.mockImplementation(({ id, data }, options) => {
      expensesData = expensesData.map((e) => (e.id === id ? { ...e, ...data } : e));
      options?.onSuccess?.();
    });
    deleteMutate.mockImplementation((id, options) => {
      expensesData = expensesData.filter((e) => e.id !== id);
      options?.onSuccess?.();
    });
  });

  test('renders loading state and fetched expenses', () => {
    isLoading = true;
    const { rerender } = render(<Expenses />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    isLoading = false;
    expensesData = [makeExpense({ id: 1, description: 'Coffee' })];
    rerender(<Expenses />);
    expect(screen.getByText('Coffee')).toBeInTheDocument();
  });

  test('renders safe empty state when no expenses', () => {
    render(<Expenses />);
    expect(screen.getByText('No expenses found. Add your first expense!')).toBeInTheDocument();
  });

  test('supports create/edit/delete flow and reflects updated values', async () => {
    const { rerender } = render(<Expenses />);

    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '12.5' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Created Expense' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-05' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    rerender(<Expenses />);

    await waitFor(() => expect(screen.getByText('Created Expense')).toBeInTheDocument());

    fireEvent.click(screen.getByTitle('Edit'));
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated Expense' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    rerender(<Expenses />);

    await waitFor(() => expect(screen.getByText('Updated Expense')).toBeInTheDocument());

    fireEvent.click(screen.getByTitle('Delete'));
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[1]);
    rerender(<Expenses />);

    await waitFor(() =>
      expect(screen.getByText('No expenses found. Add your first expense!')).toBeInTheDocument()
    );
  });

  test('shows validation errors on invalid create submission', () => {
    render(<Expenses />);
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();
  });
});
