import { expect, type Page } from '@playwright/test';
import { BasePage } from '../core/BasePage';
import { ImportWizard } from '../components/ImportWizard';

export class ImportPage extends BasePage {
  readonly wizard: ImportWizard;

  constructor(page: Page) {
    super(page);
    this.wizard = new ImportWizard(page);
  }

  async goto() {
    await super.goto('/import');
    await expect(this.page.getByRole('heading', { name: 'Import Expenses' })).toBeVisible();
  }

  async startImport() {
    await this.page.getByRole('button', { name: 'Start Import' }).click();
    await expect(this.page.getByText('Upload CSV File')).toBeVisible();
  }

  async expectHistoryEmptyState() {
    await expect(this.page.getByText('No import history yet')).toBeVisible();
  }
}
