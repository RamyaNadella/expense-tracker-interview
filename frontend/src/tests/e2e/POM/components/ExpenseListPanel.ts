import { expect, type Page } from '@playwright/test';

export class ExpenseListPanel {
  constructor(private readonly page: Page) {}

  async expectExpenseVisible(description: string) {
    await expect(this.page.getByText(description)).toBeVisible();
  }

  async expectExpenseNotVisible(description: string) {
    await expect(this.page.getByText(description)).toHaveCount(0);
  }

  async expectEmptyState() {
    await expect(this.page.getByText('No expenses found. Add your first expense!')).toBeVisible();
  }

  async clickEditFirst() {
    await this.page.getByTitle('Edit').first().click();
  }

  async clickDeleteFirst() {
    await this.page.getByTitle('Delete').first().click();
  }

  async confirmDelete() {
    await this.page.getByRole('button', { name: 'Delete' }).last().click();
  }
}
