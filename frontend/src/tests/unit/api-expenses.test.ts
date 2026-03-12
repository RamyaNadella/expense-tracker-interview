import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as expensesApi from '../../api/expenses';

describe('api/expenses query params', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);
  });

  test('serializes list query params correctly', async () => {
    await expensesApi.getExpenses({
      search: 'coffee',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    });

    const [url] = vi.mocked(global.fetch).mock.calls[0];
    expect(String(url)).toContain('/api/expenses?');
    expect(String(url)).toContain('search=coffee');
    expect(String(url)).toContain('startDate=2026-03-01');
    expect(String(url)).toContain('endDate=2026-03-31');
  });

  test('serializes monthly-total params correctly', async () => {
    await expensesApi.getMonthlyTotal(2026, 3);
    const [url] = vi.mocked(global.fetch).mock.calls[0];
    expect(String(url)).toContain('/api/expenses/monthly-total?year=2026&month=3');
  });
});
