import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateToken } from '../../middleware/auth.js';

vi.mock('../../services/expenseService.js', () => ({
  listExpenses: vi.fn().mockResolvedValue([]),
  getExpense: vi.fn().mockResolvedValue(null),
  createExpense: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    categoryId: 1,
    amount: 50,
    description: 'ok',
    date: '2026-01-01',
    createdAt: new Date().toISOString(),
  }),
  updateExpense: vi.fn().mockResolvedValue(null),
  deleteExpense: vi.fn().mockResolvedValue(false),
  getMonthlyTotal: vi.fn().mockResolvedValue(0),
}));

const { default: expensesRouter } = await import('../../routes/expenses.js');
const expenseService = await import('../../services/expenseService.js');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/expenses', expensesRouter);
  return app;
}

function authHeader() {
  const token = generateToken({ userId: 999999, email: 'unit@example.com' });
  return { Authorization: `Bearer ${token}` };
}

describe('expenses route validation and auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('POST /api/expenses returns 401 when token is missing', async () => {
    const app = makeApp();
    const response = await request(app).post('/api/expenses').send({});
    expect(response.status).toBe(401);
  });

  test('GET /api/expenses returns 401 when token is missing', async () => {
    const app = makeApp();
    const response = await request(app).get('/api/expenses');
    expect(response.status).toBe(401);
  });

  test('PUT /api/expenses/:id returns 401 when token is missing', async () => {
    const app = makeApp();
    const response = await request(app).put('/api/expenses/1').send({});
    expect(response.status).toBe(401);
  });

  test('DELETE /api/expenses/:id returns 401 when token is missing', async () => {
    const app = makeApp();
    const response = await request(app).delete('/api/expenses/1');
    expect(response.status).toBe(401);
  });

  test('GET /api/expenses/monthly-total returns 401 when token is missing', async () => {
    const app = makeApp();
    const response = await request(app).get('/api/expenses/monthly-total');
    expect(response.status).toBe(401);
  });

  test('POST /api/expenses rejects negative amount', async () => {
    const app = makeApp();
    const response = await request(app)
      .post('/api/expenses')
      .set(authHeader())
      .send({ categoryId: 1, amount: -5, description: 'bad', date: '2026-03-01' });
    expect(response.status).toBe(400);
    expect(expenseService.createExpense).not.toHaveBeenCalled();
  });

  test('POST /api/expenses rejects invalid date', async () => {
    const app = makeApp();
    const response = await request(app)
      .post('/api/expenses')
      .set(authHeader())
      .send({ categoryId: 1, amount: 5, description: 'bad', date: '03/01/2026' });
    expect(response.status).toBe(400);
    expect(expenseService.createExpense).not.toHaveBeenCalled();
  });

  test('POST /api/expenses rejects empty description', async () => {
    const app = makeApp();
    const response = await request(app)
      .post('/api/expenses')
      .set(authHeader())
      .send({ categoryId: 1, amount: 5, description: '', date: '2026-03-01' });
    expect(response.status).toBe(400);
    expect(expenseService.createExpense).not.toHaveBeenCalled();
  });

  test('POST /api/expenses rejects missing amount', async () => {
    const app = makeApp();
    const response = await request(app)
      .post('/api/expenses')
      .set(authHeader())
      .send({ categoryId: 1, description: 'x', date: '2026-03-01' });
    expect(response.status).toBe(400);
    expect(expenseService.createExpense).not.toHaveBeenCalled();
  });

  test('POST /api/expenses rejects missing date', async () => {
    const app = makeApp();
    const response = await request(app)
      .post('/api/expenses')
      .set(authHeader())
      .send({ categoryId: 1, amount: 5, description: 'x' });
    expect(response.status).toBe(400);
    expect(expenseService.createExpense).not.toHaveBeenCalled();
  });

  test('POST /api/expenses rejects missing category field', async () => {
    const app = makeApp();
    const response = await request(app)
      .post('/api/expenses')
      .set(authHeader())
      .send({ amount: 5, description: 'x', date: '2026-03-01' });
    expect(response.status).toBe(400);
    expect(expenseService.createExpense).not.toHaveBeenCalled();
  });

  test.todo('PUT /api/expenses/:id rejects invalid expense ID format');
  test.todo('DELETE /api/expenses/:id rejects invalid expense ID format');
});
