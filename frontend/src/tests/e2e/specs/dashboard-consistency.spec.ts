import { expect, test, type APIRequestContext } from '@playwright/test';
import { DashboardPage } from '../POM/pages/DashboardPage';
import { authHeaders } from '../utils/testUser';
import { loginWithFreshUser } from '../utils/session';

async function seedExpense(
  request: APIRequestContext,
  token: string,
  data: { categoryId: number; amount: number; description: string; date: string }
) {
  const create = await request.post('/api/expenses', {
    headers: authHeaders(token),
    data,
  });
  expect(create.ok()).toBeTruthy();
}

test.describe('e2e: dashboard consistency', () => {
  test('renders totals and count that match API data', async ({ page, request }, testInfo) => {
    const account = await test.step('create and login fresh test user', async () => {
      return loginWithFreshUser(page, request, testInfo, 'dashboard_consistency');
    });

    const categoryId = await test.step('fetch a valid category for seeding expenses', async () => {
      const categories = await request.get('/api/categories');
      expect(categories.ok()).toBeTruthy();
      return (await categories.json())[0].id as number;
    });

    await test.step('seed two expenses via API', async () => {
      await seedExpense(request, account.token, {
        categoryId,
        amount: 30,
        description: 'Dashboard Expense A',
        date: '2026-03-03',
      });
      await seedExpense(request, account.token, {
        categoryId,
        amount: 20,
        description: 'Dashboard Expense B',
        date: '2026-03-04',
      });
    });

    const { list, total } = await test.step('read seeded expenses from API', async () => {
      const listResponse = await request.get('/api/expenses', {
        headers: authHeaders(account.token),
      });
      expect(listResponse.ok()).toBeTruthy();
      const list = await listResponse.json();
      const total = list.reduce((sum: number, item: { amount: number }) => sum + Number(item.amount), 0);
      return { list, total };
    });

    await test.step('open dashboard and verify summary widgets render', async () => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await dashboard.expectSummaryVisible();
      await dashboard.expectNoNaNOrInfinity();
    });

    await test.step('verify dashboard totals and recent list match API data', async () => {
      await expect(page.getByText(`$${total.toFixed(2)}`)).toBeVisible();
      const totalExpensesValue = page
        .locator('dt', { hasText: 'Total Expenses' })
        .locator('xpath=following-sibling::dd[1]');
      await expect(totalExpensesValue).toHaveText(String(list.length));
      await expect(page.getByText('Dashboard Expense A')).toBeVisible();
    });
  });
});
