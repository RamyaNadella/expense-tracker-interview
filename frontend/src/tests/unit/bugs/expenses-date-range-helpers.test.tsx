import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

describe('bugs: expenses date range helpers', () => {
  test('avoids UTC ISO split in date range helper output', () => {
    const sourcePath = path.resolve(process.cwd(), 'src/pages/Expenses.tsx');
    const source = readFileSync(sourcePath, 'utf8');
    expect(source).not.toContain("toISOString().split('T')[0]");
  });

  test('enforces from/to ordering guard before applying custom date range', () => {
    const sourcePath = path.resolve(process.cwd(), 'src/pages/Expenses.tsx');
    const source = readFileSync(sourcePath, 'utf8');
    expect(source).toContain('customStartDate <= customEndDate');
  });
});
