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
    const account = await loginWithFreshUser(page, request, testInfo, 'expenses_crud');
    const expensesPage = new ExpensesPage(page);

    await expensesPage.goto();
    await expensesPage.listPanel.expectEmptyState();

    await expensesPage.openCreateModal();
    await expensesPage.formModal.fillForm(expenseScenarios.create);
    await expensesPage.formModal.submitCreate();
    await expensesPage.listPanel.expectExpenseVisible(expenseScenarios.create.description);

    const listAfterCreate = await request.get('/api/expenses', {
      headers: authHeaders(account.token),
    });
    expect(listAfterCreate.ok()).toBeTruthy();
    const createdExpenses = await listAfterCreate.json();
    expect(
      createdExpenses.some((item: { description: string }) => item.description === expenseScenarios.create.description)
    ).toBeTruthy();

    await expensesPage.listPanel.clickEditFirst();
    await expensesPage.formModal.fillForm(expenseScenarios.update);
    await expensesPage.formModal.submitUpdate();
    await expensesPage.listPanel.expectExpenseVisible(expenseScenarios.update.description);

    await expensesPage.listPanel.clickDeleteFirst();
    await expensesPage.listPanel.confirmDelete();
    await expensesPage.listPanel.expectEmptyState();
  });

  test('keeps expenses isolated between users', async ({ page, request }, testInfo) => {
    const accountA = await loginWithFreshUser(page, request, testInfo, 'isolation_a');
    const categoryId = await getFirstCategoryId(request);
    const userAExpenseLabel = `isolation-expense-${testInfo.workerIndex}-${Date.now()}`;

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

    const topNav = new TopNav(page);
    await topNav.logout();

    const accountB = await loginWithFreshUser(page, request, testInfo, 'isolation_b');
    const expensesPage = new ExpensesPage(page);
    await expensesPage.goto();
    await expensesPage.listPanel.expectExpenseNotVisible(userAExpenseLabel);

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
