import { expect, test, type APIRequestContext } from '@playwright/test';
import { authHeaders } from '../utils/testUser';
import { loginWithFreshUser } from '../utils/session';

async function getFirstCategoryId(request: APIRequestContext): Promise<number> {
  const categories = await request.get('/api/categories');
  expect(categories.ok()).toBeTruthy();
  const body = await categories.json();
  return body[0].id as number;
}

test.describe('bugs: dashboard recent actions', () => {
  test('edit action from dashboard opens edit modal on expenses page', async ({ page, request }, testInfo) => {
    const account = await loginWithFreshUser(page, request, testInfo, 'bug_dashboard_edit');
    const categoryId = await getFirstCategoryId(request);

    const description = `dashboard-edit-${Date.now()}`;
    await request.post('/api/expenses', {
      headers: authHeaders(account.token),
      data: {
        categoryId,
        amount: 22.5,
        description,
        date: '2026-03-10',
      },
    });

    await page.goto('/');
    await expect(page.getByText(description)).toBeVisible();
    await page.getByTitle('Edit').first().click();

    await expect(page.getByRole('heading', { name: 'Expenses' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Edit Expense' })).toBeVisible();
  });

  test('delete action from dashboard removes expense end-to-end', async ({ page, request }, testInfo) => {
    const account = await loginWithFreshUser(page, request, testInfo, 'bug_dashboard_delete');
    const categoryId = await getFirstCategoryId(request);

    const description = `dashboard-delete-${Date.now()}`;
    await request.post('/api/expenses', {
      headers: authHeaders(account.token),
      data: {
        categoryId,
        amount: 33.75,
        description,
        date: '2026-03-11',
      },
    });

    await page.goto('/');
    await expect(page.getByText(description)).toBeVisible();
    await page.getByTitle('Delete').first().click();
    await page.getByRole('button', { name: 'Delete' }).last().click();

    await expect(page.getByText(description)).toHaveCount(0);
  });
});
