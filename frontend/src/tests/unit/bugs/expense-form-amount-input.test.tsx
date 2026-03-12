import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../../../hooks/useCategories', () => ({
  useCategories: () => ({
    data: [{ id: 1, name: 'Food', icon: 'utensils' }],
  }),
}));

import { ExpenseForm } from '../../../components/ExpenseForm';

describe('bugs: ExpenseForm amount input', () => {
  test('sets numeric guardrails on amount input', () => {
    render(<ExpenseForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const amount = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(amount.type).toBe('number');
    expect(amount.min).toBe('0.01');
    expect(amount.step).toBe('0.01');
  });

  test('does not accept exponent-like values as valid amount submissions', () => {
    const onSubmit = vi.fn();
    render(<ExpenseForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '1e-10' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Exponent amount' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-05' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
