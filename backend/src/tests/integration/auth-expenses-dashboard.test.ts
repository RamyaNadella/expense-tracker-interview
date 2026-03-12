import request from 'supertest';
import { beforeAll, describe, expect, test } from 'vitest';
import app from '../../app.js';
import { createFreshTestUser, getAnyCategoryId, runIntegrationPreflight } from './helpers/test-utils.js';

const preflight = await runIntegrationPreflight();
if (!preflight.ok) {
  console.warn(`[integration-skip] ${preflight.reason}`);
}
const itIfReady = preflight.ok ? test : test.skip;

interface TestUser {
  id: number;
  email: string;
  password: string;
  token: string;
}

let userA: TestUser;
let userB: TestUser;

async function createExpense(token: string, amount: number, description: string, date: string) {
  const categoryId = await getAnyCategoryId();
  return request(app)
    .post('/api/expenses')
    .set('Authorization', `Bearer ${token}`)
    .send({
      categoryId,
      amount,
      description,
      date,
    });
}

describe('integration: auth + expenses + dashboard', () => {
  beforeAll(async () => {
    if (!preflight.ok) return;
    userA = await createFreshTestUser('auth_expenses_a');
    userB = await createFreshTestUser('auth_expenses_b');
  });

  itIfReady('POST /api/auth/register registers a new user with valid details', async () => {
    const email = `integration_register_${Date.now()}@example.test`;
    const response = await request(app).post('/api/auth/register').send({
      email,
      password: 'password123',
    });
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(email);
    expect(typeof response.body.token).toBe('string');
  });

  itIfReady('POST /api/auth/register rejects registration when email already exists', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: userA.email,
      password: 'password123',
    });
    expect(response.status).toBe(409);
  });

  itIfReady('POST /api/auth/login returns JWT for valid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: userA.email,
      password: userA.password,
    });
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(userA.email);
    expect(typeof response.body.token).toBe('string');
  });

  itIfReady('POST /api/auth/login rejects non-existent email', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: `missing_${Date.now()}@example.test`,
      password: 'password123',
    });
    expect(response.status).toBe(401);
  });

  itIfReady('POST /api/auth/login rejects incorrect password', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: userA.email,
      password: 'wrong-password',
    });
    expect(response.status).toBe(401);
  });

  itIfReady('POST /api/expenses creates an expense for authenticated user', async () => {
    const response = await createExpense(userA.token, 12.45, 'created-expense', '2026-03-10');
    expect(response.status).toBe(201);
    expect(response.body.userId).toBe(userA.id);
    expect(Number(response.body.amount)).toBeCloseTo(12.45, 2);
  });

  itIfReady('GET /api/expenses returns only authenticated user expenses', async () => {
    await createExpense(userA.token, 20, 'owned-by-a', '2026-03-11');
    await createExpense(userB.token, 30, 'owned-by-b', '2026-03-11');

    const response = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.every((expense: { userId: number }) => expense.userId === userA.id)).toBe(true);
  });

  itIfReady('PUT /api/expenses/:id updates owned expense', async () => {
    const created = await createExpense(userA.token, 5, 'to-update', '2026-03-11');
    const update = await request(app)
      .put(`/api/expenses/${created.body.id}`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ description: 'updated-description', amount: 99.99 });

    expect(update.status).toBe(200);
    expect(update.body.description).toBe('updated-description');
    expect(Number(update.body.amount)).toBeCloseTo(99.99, 2);
  });

  itIfReady('PUT /api/expenses/:id returns 404 for nonexistent expense', async () => {
    const response = await request(app)
      .put('/api/expenses/999999999')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ description: 'x' });
    expect(response.status).toBe(404);
  });

  itIfReady('PUT /api/expenses/:id does not allow updating another user expense', async () => {
    const created = await createExpense(userA.token, 15, 'cross-user-update', '2026-03-11');
    const response = await request(app)
      .put(`/api/expenses/${created.body.id}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ description: 'should-not-update' });
    expect(response.status).toBe(404);
  });

  itIfReady('DELETE /api/expenses/:id deletes owned expense', async () => {
    const created = await createExpense(userA.token, 15, 'to-delete', '2026-03-11');
    const response = await request(app)
      .delete(`/api/expenses/${created.body.id}`)
      .set('Authorization', `Bearer ${userA.token}`);
    expect(response.status).toBe(204);
  });

  itIfReady('DELETE /api/expenses/:id returns 404 for nonexistent expense', async () => {
    const response = await request(app)
      .delete('/api/expenses/999999999')
      .set('Authorization', `Bearer ${userA.token}`);
    expect(response.status).toBe(404);
  });

  itIfReady('DELETE /api/expenses/:id does not allow deleting another user expense', async () => {
    const created = await createExpense(userA.token, 17, 'cross-user-delete', '2026-03-11');
    const response = await request(app)
      .delete(`/api/expenses/${created.body.id}`)
      .set('Authorization', `Bearer ${userB.token}`);
    expect(response.status).toBe(404);
  });

  itIfReady('GET /api/categories returns available categories', async () => {
    const response = await request(app).get('/api/categories');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  itIfReady('dashboard count and average are computed correctly from GET /api/expenses', async () => {
    const dashboardUser = await createFreshTestUser('dashboard_count_avg');
    await createExpense(dashboardUser.token, 10, 'd1', '2026-03-05');
    await createExpense(dashboardUser.token, 20, 'd2', '2026-03-05');
    await createExpense(dashboardUser.token, 30, 'd3', '2026-03-05');

    const response = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${dashboardUser.token}`);
    expect(response.status).toBe(200);

    const list = response.body as Array<{ amount: number }>;
    const count = list.length;
    const sum = list.reduce((acc, item) => acc + Number(item.amount), 0);
    const avg = count === 0 ? 0 : sum / count;

    expect(count).toBe(3);
    expect(sum).toBeCloseTo(60, 2);
    expect(avg).toBeCloseTo(20, 2);
  });

  itIfReady('monthly-total current and previous month are suitable for MoM comparison', async () => {
    const dashboardUser = await createFreshTestUser('dashboard_mom');
    await createExpense(dashboardUser.token, 100, 'current-month', '2026-03-10');
    await createExpense(dashboardUser.token, 40, 'previous-month', '2026-02-20');

    const current = await request(app)
      .get('/api/expenses/monthly-total?year=2026&month=3')
      .set('Authorization', `Bearer ${dashboardUser.token}`);
    const previous = await request(app)
      .get('/api/expenses/monthly-total?year=2026&month=2')
      .set('Authorization', `Bearer ${dashboardUser.token}`);

    expect(current.status).toBe(200);
    expect(previous.status).toBe(200);
    expect(Number(current.body.total)).toBeCloseTo(100, 2);
    expect(Number(previous.body.total)).toBeCloseTo(40, 2);
  });

  itIfReady('GET /api/expenses and monthly-total include only authenticated user data', async () => {
    const ua = await createFreshTestUser('dashboard_scope_a');
    const ub = await createFreshTestUser('dashboard_scope_b');
    await createExpense(ua.token, 11, 'ua1', '2026-03-01');
    await createExpense(ub.token, 99, 'ub1', '2026-03-01');

    const list = await request(app).get('/api/expenses').set('Authorization', `Bearer ${ua.token}`);
    const total = await request(app)
      .get('/api/expenses/monthly-total?year=2026&month=3')
      .set('Authorization', `Bearer ${ua.token}`);

    expect(list.status).toBe(200);
    expect(total.status).toBe(200);
    expect((list.body as Array<{ userId: number }>).every((e) => e.userId === ua.id)).toBe(true);
    expect(Number(total.body.total)).toBeCloseTo(11, 2);
  });

  itIfReady('GET /api/expenses returns empty list for a user with no expenses', async () => {
    const freshUser = await createFreshTestUser('empty_expenses');
    const response = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${freshUser.token}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  itIfReady('GET /api/expenses supports multiple expenses for a user', async () => {
    const multiUser = await createFreshTestUser('multi_expenses');
    await createExpense(multiUser.token, 1, 'm1', '2026-03-01');
    await createExpense(multiUser.token, 2, 'm2', '2026-03-02');
    const response = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${multiUser.token}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  itIfReady('POST /api/expenses stores decimal amounts', async () => {
    const decimalUser = await createFreshTestUser('decimal_store');
    const response = await createExpense(decimalUser.token, 12.34, 'decimal', '2026-03-01');
    expect(response.status).toBe(201);
    expect(Number(response.body.amount)).toBeCloseTo(12.34, 2);
  });

  itIfReady('monthly-total returns exact sum for month and zero for empty month', async () => {
    const totalsUser = await createFreshTestUser('monthly_total');
    await createExpense(totalsUser.token, 10.1, 'a', '2026-04-01');
    await createExpense(totalsUser.token, 20.2, 'b', '2026-04-02');

    const april = await request(app)
      .get('/api/expenses/monthly-total?year=2026&month=4')
      .set('Authorization', `Bearer ${totalsUser.token}`);
    const may = await request(app)
      .get('/api/expenses/monthly-total?year=2026&month=5')
      .set('Authorization', `Bearer ${totalsUser.token}`);

    expect(april.status).toBe(200);
    expect(Number(april.body.total)).toBeCloseTo(30.3, 2);
    expect(may.status).toBe(200);
    expect(Number(may.body.total)).toBe(0);
  });

  itIfReady('monthly-total excludes expenses outside requested month', async () => {
    const monthUser = await createFreshTestUser('month_filter');
    await createExpense(monthUser.token, 50, 'included', '2026-06-10');
    await createExpense(monthUser.token, 80, 'excluded', '2026-07-10');

    const june = await request(app)
      .get('/api/expenses/monthly-total?year=2026&month=6')
      .set('Authorization', `Bearer ${monthUser.token}`);

    expect(june.status).toBe(200);
    expect(Number(june.body.total)).toBeCloseTo(50, 2);
  });

  itIfReady('categories endpoint is public, unique, and has required fields', async () => {
    const response = await request(app).get('/api/categories');
    expect(response.status).toBe(200);

    const names = (response.body as Array<{ name: string }>).map((c) => c.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);

    for (const category of response.body as Array<{ id: number; name: string }>) {
      expect(typeof category.id).toBe('number');
      expect(typeof category.name).toBe('string');
    }
  });

  itIfReady('dashboard summary is zero-safe and handles month-over-month with empty previous month', async () => {
    const zeroUser = await createFreshTestUser('dashboard_zero_safe');
    const expenses = await request(app).get('/api/expenses').set('Authorization', `Bearer ${zeroUser.token}`);
    const current = await request(app)
      .get('/api/expenses/monthly-total?year=2026&month=8')
      .set('Authorization', `Bearer ${zeroUser.token}`);
    const previous = await request(app)
      .get('/api/expenses/monthly-total?year=2026&month=7')
      .set('Authorization', `Bearer ${zeroUser.token}`);

    const list = expenses.body as Array<{ amount: number }>;
    const count = list.length;
    const sum = list.reduce((acc, item) => acc + Number(item.amount), 0);
    const avg = count === 0 ? 0 : sum / count;
    expect(expenses.status).toBe(200);
    expect(current.status).toBe(200);
    expect(previous.status).toBe(200);
    expect(count).toBe(0);
    expect(avg).toBe(0);
    expect(Number(current.body.total)).toBe(0);
    expect(Number(previous.body.total)).toBe(0);
  });
});
