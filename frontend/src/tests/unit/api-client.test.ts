import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ApiError, apiRequest } from '../../api/client';

describe('api/client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('injects Authorization header when token exists', async () => {
    localStorage.setItem('token', 'abc123');
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);

    await apiRequest('/expenses');

    const [, options] = fetchMock.mock.calls[0];
    expect((options?.headers as Record<string, string>).Authorization).toBe('Bearer abc123');
  });

  test('throws ApiError with normalized message on non-ok response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid input' }),
    } as Response);

    await expect(apiRequest('/expenses')).rejects.toBeInstanceOf(ApiError);
    await expect(apiRequest('/expenses')).rejects.toMatchObject({ message: 'Invalid input', status: 400 });
  });

  test('returns undefined on 204 responses', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => ({}),
    } as Response);

    const result = await apiRequest('/expenses/1', { method: 'DELETE' });
    expect(result).toBeUndefined();
  });
});
