import { expect, test, type APIRequestContext } from '@playwright/test';
import { ExpensesPage } from '../POM/pages/ExpensesPage';
import { TopNav } from '../POM/components/TopNav';
import { loginWithFreshUser } from '../utils/session';
import { authHeaders } from '../utils/testUser';
import { expenseScenarios } from '../utils/scenarios';

async function getFirstCategoryId(request: APIRequestContext): Promise<number> {
  const categories = await request.get('/api/categories');
  expect(categories.ok()).toBeTruthy();
  const body = await categories.json();
  expect(Array.isArray(body)).toBeTruthy();
  expect(body.length).toBeGreaterThan(0);
  return body[0].id as number;
}

test.describe('e2e: expenses CRUD and isolation', () => {
  test('creates, edits, deletes expense and verifies via API', async ({ page, request }, testInfo) => {
    const account = await test.step('create and login fresh test user', async () => {
      return loginWithFreshUser(page, request, testInfo, 'expenses_crud');
    });
    const expensesPage = new ExpensesPage(page);

    await test.step('open expenses page and verify initial empty state', async () => {
      await expensesPage.goto();
      await expensesPage.listPanel.expectEmptyState();
    });

    await test.step('create expense from UI and verify it appears in list', async () => {
      await expensesPage.openCreateModal();
      await expensesPage.formModal.fillForm(expenseScenarios.create);
      await expensesPage.formModal.submitCreate();
      await expensesPage.listPanel.expectExpenseVisible(expenseScenarios.create.description);
    });

    await test.step('verify created expense is persisted via API', async () => {
      const listAfterCreate = await request.get('/api/expenses', {
        headers: authHeaders(account.token),
      });
      expect(listAfterCreate.ok()).toBeTruthy();
      const createdExpenses = await listAfterCreate.json();
      expect(
        createdExpenses.some((item: { description: string }) => item.description === expenseScenarios.create.description)
      ).toBeTruthy();
    });

    await test.step('edit expense from UI and verify updated description', async () => {
      await expensesPage.listPanel.clickEditFirst();
      await expensesPage.formModal.fillForm(expenseScenarios.update);
      await expensesPage.formModal.submitUpdate();
      await expensesPage.listPanel.expectExpenseVisible(expenseScenarios.update.description);
    });

    await test.step('delete expense from UI and verify list is empty', async () => {
      await expensesPage.listPanel.clickDeleteFirst();
      await expensesPage.listPanel.confirmDelete();
      await expensesPage.listPanel.expectEmptyState();
    });
  });

  test('keeps expenses isolated between users', async ({ page, request }, testInfo) => {
    const accountA = await test.step('create and login first user', async () => {
      return loginWithFreshUser(page, request, testInfo, 'isolation_a');
    });
    const categoryId = await test.step('fetch category for first user expense', async () => {
      return getFirstCategoryId(request);
    });
    const userAExpenseLabel = `isolation-expense-${testInfo.workerIndex}-${Date.now()}`;

    await test.step('create expense for first user via API', async () => {
      const createForA = await request.post('/api/expenses', {
        headers: authHeaders(accountA.token),
        data: {
          categoryId,
          amount: 11.11,
          description: userAExpenseLabel,
          date: '2026-03-12',
        },
      });
      expect(createForA.ok()).toBeTruthy();
    });

    const accountB = await test.step('logout first user and login second user', async () => {
      const topNav = new TopNav(page);
      await topNav.logout();
      return loginWithFreshUser(page, request, testInfo, 'isolation_b');
    });

    await test.step('verify second user cannot see first user expense in UI', async () => {
      const expensesPage = new ExpensesPage(page);
      await expensesPage.goto();
      await expensesPage.listPanel.expectExpenseNotVisible(userAExpenseLabel);
    });

    await test.step('verify second user cannot see first user expense in API', async () => {
      const listForB = await request.get('/api/expenses', {
        headers: authHeaders(accountB.token),
      });
      expect(listForB.ok()).toBeTruthy();
      const bExpenses = await listForB.json();
      expect(
        bExpenses.some((item: { description: string }) => item.description === userAExpenseLabel)
      ).toBeFalsy();
    });
  });
});
