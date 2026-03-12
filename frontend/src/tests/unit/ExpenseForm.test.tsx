import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    data: [
      { id: 1, name: 'Food', icon: 'utensils' },
      { id: 2, name: 'Transport', icon: 'car' },
    ],
  }),
}));

import { ExpenseForm } from '../../components/ExpenseForm';

describe('ExpenseForm', () => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('blocks invalid submit and shows validation errors', () => {
    render(<ExpenseForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  test('submits valid expense payload', () => {
    render(<ExpenseForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '25.5' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Dinner' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-05' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onSubmit).toHaveBeenCalledWith({
      categoryId: 2,
      amount: 25.5,
      description: 'Dinner',
      date: '2026-03-05',
    });
  });
});
