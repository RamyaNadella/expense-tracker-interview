import request from 'supertest';
import app from '../../../app.js';
import db from '../../../db/knex.js';

const TEST_EMAIL_PREFIX = 'itest_';
const TEST_EMAIL_DOMAIN = 'example.test';

export interface IntegrationPreflight {
  ok: boolean;
  reason?: string;
}

export async function runIntegrationPreflight(): Promise<IntegrationPreflight> {
  try {
    const health = await request(app).get('/api/health');
    if (health.status !== 200) {
      return { ok: false, reason: `health endpoint returned status ${health.status}` };
    }

    await db.raw('select 1 as ok');
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: `service/db preflight failed: ${message}` };
  }
}

export function buildUniqueEmail(prefix: string): string {
  const worker = process.env.VITEST_POOL_ID || process.env.VITEST_WORKER_ID || '0';
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${TEST_EMAIL_PREFIX}${prefix}_${worker}_${unique}@${TEST_EMAIL_DOMAIN}`;
}

export async function createFreshTestUser(prefix: string): Promise<{ email: string; password: string; token: string; id: number }> {
  const email = buildUniqueEmail(prefix);
  const password = 'password123';
  const register = await request(app).post('/api/auth/register').send({ email, password });

  if (register.status !== 201) {
    throw new Error(`failed to create test user: status=${register.status} body=${JSON.stringify(register.body)}`);
  }

  return {
    email,
    password,
    token: register.body.token,
    id: register.body.user.id,
  };
}

export async function getAnyCategoryId(): Promise<number> {
  const response = await request(app).get('/api/categories');
  if (response.status !== 200 || !Array.isArray(response.body) || response.body.length === 0) {
    throw new Error(`failed to fetch categories: status=${response.status}`);
  }
  return response.body[0].id;
}

export async function cleanupTestUsers(): Promise<void> {
  await db('users').where('email', 'like', `${TEST_EMAIL_PREFIX}%@${TEST_EMAIL_DOMAIN}`).delete();
}
