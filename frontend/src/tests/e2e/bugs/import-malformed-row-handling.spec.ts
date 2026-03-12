import { expect, test } from '@playwright/test';
import { ImportPage } from '../POM/pages/ImportPage';
import { loginWithFreshUser } from '../utils/session';

test.describe('bugs: import malformed row handling', () => {
  test('does not count malformed amount row as valid importable row', async ({ page, request }, testInfo) => {
    await loginWithFreshUser(page, request, testInfo, 'bug_import_malformed');
    const importPage = new ImportPage(page);

    await importPage.goto();
    await importPage.startImport();
    await importPage.wizard.uploadCsv(
      `malformed-row-${Date.now()}.csv`,
      [
        'Date,Amount,Description,Category',
        '2026-03-08,123 Coffee,Malformed Amount,Food',
      ].join('\n')
    );
    await importPage.wizard.expectOnMappingStep();
    await importPage.wizard.continueFromMapping();
    await importPage.wizard.expectOnPreviewStep();

    await expect(page.getByText('Validation Errors:')).toBeVisible();
    await expect(page.getByRole('button', { name: /Import 0 Expenses/i })).toBeDisabled();
  });
});
