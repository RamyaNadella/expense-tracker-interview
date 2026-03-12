import { expect, type Page } from '@playwright/test';

export class ExpenseFormModal {
  constructor(private readonly page: Page) {}

  async fillForm(params: {
    categoryName?: string;
    amount: string;
    description: string;
    date: string;
  }) {
    if (params.categoryName) {
      await this.page.getByLabel('Category').selectOption({ label: params.categoryName });
    }
    await this.page.getByLabel('Amount').fill(params.amount);
    await this.page.getByLabel('Description').fill(params.description);
    await this.page.getByLabel('Date').fill(params.date);
  }

  async submitCreate() {
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async submitUpdate() {
    await this.page.getByRole('button', { name: 'Update' }).click();
  }

  async expectValidationError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}
