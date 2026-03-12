import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e/specs',
  globalSetup: './src/tests/e2e/global.setup.ts',
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:3002/api/health',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
