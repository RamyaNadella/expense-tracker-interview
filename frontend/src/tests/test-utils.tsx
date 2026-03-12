import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement, PropsWithChildren } from 'react';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  options?: { route?: string; queryClient?: QueryClient }
) {
  const queryClient = options?.queryClient ?? createTestQueryClient();
  const route = options?.route ?? '/';

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper }),
  };
}

export function makeTestUser(prefix = 'frontend_test') {
  const worker = process.env.VITEST_POOL_ID || process.env.VITEST_WORKER_ID || '0';
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id: Number(`${worker}${Date.now().toString().slice(-4)}`),
    email: `${prefix}_${worker}_${unique}@example.test`,
  };
}

export function makeExpense(overrides?: Partial<{
  id: number;
  userId: number;
  categoryId: number;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  categoryName: string;
  categoryIcon: string;
}>) {
  const now = new Date().toISOString();
  return {
    id: 1,
    userId: 1,
    categoryId: 1,
    amount: 10,
    description: 'Lunch',
    date: '2026-03-01',
    createdAt: now,
    categoryName: 'Food',
    categoryIcon: 'utensils',
    ...overrides,
  };
}
