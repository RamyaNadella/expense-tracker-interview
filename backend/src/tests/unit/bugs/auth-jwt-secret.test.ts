import { afterEach, describe, expect, test, vi } from 'vitest';

async function importAuthModuleFresh() {
  vi.resetModules();
  return import('../../../middleware/auth.js');
}

describe('bugs: auth jwt secret', () => {
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
      return;
    }
    process.env.JWT_SECRET = originalSecret;
  });

  test('fails fast when JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;

    await expect(importAuthModuleFresh()).rejects.toThrow(/JWT_SECRET is required/i);
  });
});
