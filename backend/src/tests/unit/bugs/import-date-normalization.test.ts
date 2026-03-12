import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('bugs: import date normalization', () => {
  test('generic date parsing should preserve local calendar date without UTC conversion', () => {
    const source = readFileSync(
      new URL('../../../services/importService.ts', import.meta.url),
      'utf8'
    );

    const utcFallbackPattern =
      /const\s+parsed\s*=\s*new\s+Date\(trimmed\);\s*if\s*\(!isNaN\(parsed\.getTime\(\)\)\)\s*\{\s*return\s+parsed\.toISOString\(\)\.split\('T'\)\[0\];\s*\}/m;

    expect(source).not.toMatch(utcFallbackPattern);
  });
});
