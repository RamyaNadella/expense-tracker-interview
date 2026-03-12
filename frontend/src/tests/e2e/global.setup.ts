import { chromium, request, type FullConfig } from '@playwright/test';
import { buildUniqueEmail, TEST_PASSWORD } from './utils/testUser';

async function globalSetup(config: FullConfig) {
  const baseURL =
    (config.projects[0]?.use?.baseURL as string | undefined) || 'http://localhost:5173';

  const api = await request.newContext({ baseURL });

  const health = await api.get('/api/health');
  if (!health.ok()) {
    throw new Error(`e2e preflight failed: /api/health returned ${health.status()}`);
  }

  const email = buildUniqueEmail('global_setup');
  const register = await api.post('/api/auth/register', {
    data: {
      email,
      password: TEST_PASSWORD,
    },
  });

  if (!register.ok()) {
    throw new Error(`e2e preflight failed: register returned ${register.status()}`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  try {
    await page.goto('/');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).last().click();
    await page.getByRole('heading', { name: 'Dashboard' }).waitFor({ timeout: 10000 });
  } catch (error) {
    throw new Error(`e2e preflight failed: UI login did not succeed (${String(error)})`);
  } finally {
    await browser.close();
    await api.dispose();
  }
}

export default globalSetup;
