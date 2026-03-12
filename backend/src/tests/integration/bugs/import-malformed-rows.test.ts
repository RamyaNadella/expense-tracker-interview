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

describe('bugs: import malformed rows', () => {
  beforeAll(async () => {
    if (!preflight.ok) return;
    user = await createFreshTestUser('bugs_import_malformed');
  });

  itIfReady('treats malformed amount values as invalid rows', async () => {
    const csv = [
      'Date,Amount,Description,Category',
      '2026-03-10,123 Coffee,Bad Amount,Food',
    ].join('\n');

    const upload = await request(app)
      .post('/api/import/upload')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ fileName: 'malformed-amount.csv', csvContent: csv });

    expect(upload.status).toBe(201);

    const mapping = await request(app)
      .post(`/api/import/session/${upload.body.session.id}/mapping`)
      .set('Authorization', `Bearer ${user.token}`)
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
    expect(mapping.body.invalidCount).toBe(1);
  });
});
