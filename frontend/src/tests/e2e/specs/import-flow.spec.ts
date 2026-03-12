import { expect, test } from '@playwright/test';
import { ImportPage } from '../POM/pages/ImportPage';
import { ExpensesPage } from '../POM/pages/ExpensesPage';
import { loginWithFreshUser } from '../utils/session';
import { authHeaders } from '../utils/testUser';
import { importScenarios } from '../utils/scenarios';

test.describe('e2e: import flow', () => {
  test('imports valid CSV rows and reflects data in UI and API', async ({ page, request }, testInfo) => {
    const account = await loginWithFreshUser(page, request, testInfo, 'import_happy');
    const importPage = new ImportPage(page);
    const expensesPage = new ExpensesPage(page);

    await importPage.goto();
    await importPage.startImport();
    await importPage.wizard.uploadCsv(importScenarios.happyPath.fileName, importScenarios.happyPath.csv);
    await importPage.wizard.expectOnMappingStep();
    await importPage.wizard.continueFromMapping();
    await importPage.wizard.expectOnPreviewStep();

    await page.getByRole('button', { name: 'Import 2 Expenses' }).click();
    await expect(page.getByText('Import Complete!')).toBeVisible();
    await page.getByRole('button', { name: 'View Expenses' }).click();

    await expect(page.getByRole('heading', { name: 'Expenses' })).toBeVisible();
    for (const description of importScenarios.happyPath.expectedDescriptions) {
      await expensesPage.listPanel.expectExpenseVisible(description);
    }

    const expenses = await request.get('/api/expenses', {
      headers: authHeaders(account.token),
    });
    expect(expenses.ok()).toBeTruthy();
    const expensesBody = await expenses.json();
    for (const description of importScenarios.happyPath.expectedDescriptions) {
      expect(
        expensesBody.some((item: { description: string }) => item.description === description)
      ).toBeTruthy();
    }

    const history = await request.get('/api/import/history', {
      headers: authHeaders(account.token),
    });
    expect(history.ok()).toBeTruthy();
    const historyBody = await history.json();
    expect(
      historyBody.some((item: { fileName: string }) => item.fileName === importScenarios.happyPath.fileName)
    ).toBeTruthy();
  });

  test('imports only valid rows when invalid rows are skipped', async ({ page, request }, testInfo) => {
    const account = await loginWithFreshUser(page, request, testInfo, 'import_mixed');
    const importPage = new ImportPage(page);

    await importPage.goto();
    await importPage.startImport();
    await importPage.wizard.uploadCsv(importScenarios.mixedRows.fileName, importScenarios.mixedRows.csv);
    await importPage.wizard.expectOnMappingStep();
    await importPage.wizard.continueFromMapping();
    await importPage.wizard.expectOnPreviewStep();

    const previewRows = page.locator('tbody tr');
    await previewRows.nth(1).getByRole('button', { name: 'Skip' }).click();
    await page.getByRole('button', { name: 'Import 1 Expenses' }).click();
    await expect(page.getByText('Import Complete!')).toBeVisible();

    const history = await request.get('/api/import/history', {
      headers: authHeaders(account.token),
    });
    expect(history.ok()).toBeTruthy();
    const historyBody = await history.json();
    const currentRun = historyBody.find(
      (item: { fileName: string }) => item.fileName === importScenarios.mixedRows.fileName
    );
    expect(currentRun).toBeTruthy();
    expect(currentRun.importedRows).toBe(1);
    expect(currentRun.skippedRows).toBe(1);
  });
});
