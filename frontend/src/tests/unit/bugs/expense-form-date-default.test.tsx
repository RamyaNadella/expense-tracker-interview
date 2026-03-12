import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

describe('bugs: ExpenseForm default date', () => {
  test('uses local calendar-safe date helper instead of UTC ISO split', () => {
    const sourcePath = path.resolve(process.cwd(), 'src/components/ExpenseForm.tsx');
    const source = readFileSync(sourcePath, 'utf8');

    expect(source).not.toContain("new Date().toISOString().split('T')[0]");
  });
});
