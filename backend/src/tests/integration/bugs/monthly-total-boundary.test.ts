import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

describe('bugs: monthly total boundaries', () => {
  test('does not derive month end date via UTC ISO conversion', () => {
    const sourcePath = path.resolve(process.cwd(), 'src/services/expenseService.ts');
    const source = readFileSync(sourcePath, 'utf8');

    const utcMonthEndPattern =
      /const\s+endDate\s*=\s*new\s+Date\(year,\s*month,\s*0\)\.toISOString\(\)\.split\('T'\)\[0\];/m;

    expect(source).not.toMatch(utcMonthEndPattern);
  });
});
