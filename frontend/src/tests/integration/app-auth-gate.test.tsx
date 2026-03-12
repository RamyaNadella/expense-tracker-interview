import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const useAuthMock = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('../../pages/Dashboard', () => ({
  Dashboard: () => <div>Dashboard Screen</div>,
}));
vi.mock('../../pages/Expenses', () => ({
  Expenses: () => <div>Expenses Screen</div>,
}));
vi.mock('../../pages/Import', () => ({
  Import: () => <div>Import Screen</div>,
}));

import App from '../../App';

describe('App auth gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading state while auth is loading', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginError: null,
      registerError: null,
      isLoginPending: false,
      isRegisterPending: false,
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders login page when unauthenticated', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginError: null,
      registerError: null,
      isLoginPending: false,
      isRegisterPending: false,
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  test('renders protected routes when authenticated', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginError: null,
      registerError: null,
      isLoginPending: false,
      isRegisterPending: false,
    });

    render(
      <MemoryRouter initialEntries={['/expenses']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Expenses Screen')).toBeInTheDocument();
  });
});
