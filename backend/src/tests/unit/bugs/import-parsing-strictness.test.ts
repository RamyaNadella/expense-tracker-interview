import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('bugs: import parsing strictness', () => {
  test('amount parsing should not accept malformed numeric text', () => {
    const source = readFileSync(
      new URL('../../../services/importService.ts', import.meta.url),
      'utf8'
    );

    expect(source).not.toContain('parseFloat');
  });
});
