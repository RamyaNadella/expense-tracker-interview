import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateToken } from '../../../middleware/auth.js';

const mockedListExpenses = vi.fn().mockResolvedValue([]);
const mockedCreateExpense = vi.fn();

vi.mock('../../../services/expenseService.js', () => ({
  listExpenses: mockedListExpenses,
  getExpense: vi.fn().mockResolvedValue(null),
  createExpense: mockedCreateExpense,
  updateExpense: vi.fn().mockResolvedValue(null),
  deleteExpense: vi.fn().mockResolvedValue(false),
  getMonthlyTotal: vi.fn().mockResolvedValue(0),
}));

const { default: expensesRouter } = await import('../../../routes/expenses.js');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/expenses', expensesRouter);
  return app;
}

function authHeader() {
  const token = generateToken({ userId: 999, email: 'validation@example.test' });
  return { Authorization: `Bearer ${token}` };
}

describe('bugs: expenses validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedListExpenses.mockResolvedValue([]);
    mockedCreateExpense.mockResolvedValue({
      id: 1,
      userId: 999,
      categoryId: 1,
      amount: 5,
      description: 'ok',
      date: '2026-03-01',
      createdAt: new Date().toISOString(),
    });
  });

  test('returns 4xx (not 500) for unknown categoryId', async () => {
    mockedCreateExpense.mockRejectedValueOnce(
      new Error('SQLITE_CONSTRAINT: FOREIGN KEY constraint failed')
    );

    const app = makeApp();
    const response = await request(app)
      .post('/api/expenses')
      .set(authHeader())
      .send({
        categoryId: 999999,
        amount: 10,
        description: 'invalid category',
        date: '2026-03-01',
      });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  test('rejects invalid pagination query params', async () => {
    const app = makeApp();
    const response = await request(app)
      .get('/api/expenses?limit=abc&offset=-1')
      .set(authHeader());

    expect(response.status).toBe(400);
  });
});
