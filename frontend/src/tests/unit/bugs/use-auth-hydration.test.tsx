import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createTestQueryClient, makeTestUser } from '../../test-utils';

vi.mock('../../../api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

import { useAuth } from '../../../hooks/useAuth';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('bugs: useAuth hydration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('does not treat stale localStorage token as authenticated without verification', async () => {
    const user = makeTestUser('stale_token');
    localStorage.setItem('token', 'stale-or-invalid-token');
    localStorage.setItem('user', JSON.stringify(user));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
