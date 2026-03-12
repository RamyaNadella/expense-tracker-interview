import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createTestQueryClient, makeTestUser } from '../test-utils';

vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

import * as authApi from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    const queryClient = createTestQueryClient();
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  test('boots authenticated only when token and valid user exist', async () => {
    const user = makeTestUser('auth_boot');
    localStorage.setItem('token', 'token-1');
    localStorage.setItem('user', JSON.stringify(user));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(user);
  });

  test('falls back to logged-out state for corrupt user payload', async () => {
    localStorage.setItem('token', 'token-2');
    localStorage.setItem('user', '{bad json');

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  test('login success stores user and authenticates', async () => {
    const user = makeTestUser('auth_login');
    vi.mocked(authApi.login).mockResolvedValue({
      user,
      token: 'token-login',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.login({ email: user.email, password: 'password123' });
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
  });
});
