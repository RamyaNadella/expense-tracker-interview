import request from 'supertest';
import { beforeAll, describe, expect, test } from 'vitest';
import app from '../../app.js';
import { createFreshTestUser, runIntegrationPreflight } from './helpers/test-utils.js';

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

describe('integration: import flow', () => {
  beforeAll(async () => {
    if (!preflight.ok) return;
    userA = await createFreshTestUser('import_user_a');
    userB = await createFreshTestUser('import_user_b');
  });

  itIfReady('create session cancels previous active session for same user', async () => {
    const first = await request(app)
      .post('/api/import/session')
      .set('Authorization', `Bearer ${userA.token}`);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/import/session')
      .set('Authorization', `Bearer ${userA.token}`);
    expect(second.status).toBe(201);

    const active = await request(app)
      .get('/api/import/session')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(active.status).toBe(200);
    expect(active.body.session.id).toBe(second.body.session.id);
  });

  itIfReady('import happy path persists imported expenses and history', async () => {
    const csv = [
      'Date,Amount,Description,Category',
      '2026-03-01,10.50,Lunch,Food',
      '2026-03-02,20.00,Train,Transport',
    ].join('\n');

    const upload = await request(app)
      .post('/api/import/upload')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        fileName: 'happy-path.csv',
        csvContent: csv,
      });
    expect(upload.status).toBe(201);
    const sessionId = upload.body.session.id;

    const mapping = await request(app)
      .post(`/api/import/session/${sessionId}/mapping`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        columnMapping: {
          date: 'Date',
          amount: 'Amount',
          description: 'Description',
          category: 'Category',
        },
      });
    expect(mapping.status).toBe(200);
    expect(mapping.body.validCount).toBe(2);

    const confirm = await request(app)
      .post(`/api/import/session/${sessionId}/confirm`)
      .set('Authorization', `Bearer ${userA.token}`);
    expect(confirm.status).toBe(200);
    expect(confirm.body.importedCount).toBe(2);

    const expenses = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${userA.token}`);
    const descriptions = (expenses.body as Array<{ description: string }>).map((x) => x.description);
    expect(descriptions).toContain('Lunch');
    expect(descriptions).toContain('Train');

    const history = await request(app)
      .get('/api/import/history')
      .set('Authorization', `Bearer ${userA.token}`);
    expect(history.status).toBe(200);
    expect(history.body.length).toBeGreaterThan(0);
    expect(history.body[0].fileName).toBe('happy-path.csv');
  });

  itIfReady('confirm failure with zero valid rows does not create partial import artifacts', async () => {
    const csv = [
      'Date,Amount,Description,Category',
      'bad-date,0,,Unknown',
    ].join('\n');

    const upload = await request(app)
      .post('/api/import/upload')
      .set('Authorization', `Bearer ${userB.token}`)
      .send({
        fileName: 'invalid-only.csv',
        csvContent: csv,
      });
    expect(upload.status).toBe(201);
    const sessionId = upload.body.session.id;

    const mapping = await request(app)
      .post(`/api/import/session/${sessionId}/mapping`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({
        columnMapping: {
          date: 'Date',
          amount: 'Amount',
          description: 'Description',
          category: 'Category',
        },
      });
    expect(mapping.status).toBe(200);
    expect(mapping.body.validCount).toBe(0);

    const confirm = await request(app)
      .post(`/api/import/session/${sessionId}/confirm`)
      .set('Authorization', `Bearer ${userB.token}`);
    expect(confirm.status).toBe(400);

    const expenses = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${userB.token}`);
    expect(expenses.status).toBe(200);
    expect(expenses.body).toEqual([]);

    const history = await request(app)
      .get('/api/import/history')
      .set('Authorization', `Bearer ${userB.token}`);
    expect(history.status).toBe(200);
    expect(history.body).toEqual([]);
  });

  itIfReady('import history is scoped to authenticated user and sorted desc by created time', async () => {
    const csvA = ['Date,Amount,Description', '2026-04-01,1,first', '2026-04-02,2,second'].join('\n');
    const csvB = ['Date,Amount,Description', '2026-04-01,3,other-user'].join('\n');

    const uploadA = await request(app)
      .post('/api/import/upload')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ fileName: 'user-a-history.csv', csvContent: csvA });
    const sessionA = uploadA.body.session.id;
    await request(app)
      .post(`/api/import/session/${sessionA}/mapping`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ columnMapping: { date: 'Date', amount: 'Amount', description: 'Description' } });
    await request(app)
      .post(`/api/import/session/${sessionA}/confirm`)
      .set('Authorization', `Bearer ${userA.token}`);

    const uploadB = await request(app)
      .post('/api/import/upload')
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ fileName: 'user-b-history.csv', csvContent: csvB });
    const sessionB = uploadB.body.session.id;
    await request(app)
      .post(`/api/import/session/${sessionB}/mapping`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ columnMapping: { date: 'Date', amount: 'Amount', description: 'Description' } });
    await request(app)
      .post(`/api/import/session/${sessionB}/confirm`)
      .set('Authorization', `Bearer ${userB.token}`);

    const historyA = await request(app)
      .get('/api/import/history')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(historyA.status).toBe(200);
    expect(historyA.body.every((entry: { userId: number }) => entry.userId === userA.id)).toBe(true);
    if (historyA.body.length > 1) {
      const first = new Date(historyA.body[0].createdAt).getTime();
      const second = new Date(historyA.body[1].createdAt).getTime();
      expect(first).toBeGreaterThanOrEqual(second);
    }
  });
});
