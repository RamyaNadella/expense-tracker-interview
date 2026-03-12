import request from 'supertest';
import { beforeAll, describe, expect, test } from 'vitest';
import app from '../../../app.js';
import { createFreshTestUser, runIntegrationPreflight } from '../helpers/test-utils.js';

const preflight = await runIntegrationPreflight();
const itIfReady = preflight.ok ? test : test.skip;

interface TestUser {
  token: string;
}

let user: TestUser;

describe('bugs: expenses api contract', () => {
  beforeAll(async () => {
    if (!preflight.ok) return;
    user = await createFreshTestUser('bugs_expenses_contract');
  });

  itIfReady('returns 4xx (not 500) when categoryId does not exist', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        categoryId: 999999999,
        amount: 21.5,
        description: 'invalid-category',
        date: '2026-03-10',
      });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  itIfReady('returns 4xx for invalid pagination parameters', async () => {
    const response = await request(app)
      .get('/api/expenses?limit=abc&offset=-1')
      .set('Authorization', `Bearer ${user.token}`);

    expect(response.status).toBe(400);
  });
});
