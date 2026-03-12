import type { APIRequestContext, TestInfo } from '@playwright/test';

export const TEST_PASSWORD = 'password123';

export interface TestAccount {
  userId: number;
  email: string;
  password: string;
  token: string;
}

function uniqueToken(testInfo?: TestInfo): string {
  const worker = testInfo?.workerIndex ?? 0;
  const retry = testInfo?.retry ?? 0;
  const repeat = testInfo?.repeatEachIndex ?? 0;
  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}_${worker}_${retry}_${repeat}_${random}`;
}

export function buildUniqueEmail(prefix: string, testInfo?: TestInfo): string {
  return `e2e_${prefix}_${uniqueToken(testInfo)}@example.test`;
}

export async function registerFreshUser(
  api: APIRequestContext,
  prefix: string,
  testInfo?: TestInfo
): Promise<TestAccount> {
  const email = buildUniqueEmail(prefix, testInfo);
  const response = await api.post('/api/auth/register', {
    data: {
      email,
      password: TEST_PASSWORD,
    },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`failed to register test user ${email}: status=${response.status()} body=${body}`);
  }

  const data = await response.json();
  return {
    userId: data.user.id,
    email,
    password: TEST_PASSWORD,
    token: data.token,
  };
}

export function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}
