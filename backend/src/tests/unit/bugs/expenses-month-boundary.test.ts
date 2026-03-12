import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('bugs: expenses month boundary', () => {
  test('monthly total calculation avoids UTC date conversion for month end boundaries', () => {
    const source = readFileSync(
      new URL('../../../services/expenseService.ts', import.meta.url),
      'utf8'
    );

    expect(source).not.toContain("toISOString().split('T')[0]");
  });
});
