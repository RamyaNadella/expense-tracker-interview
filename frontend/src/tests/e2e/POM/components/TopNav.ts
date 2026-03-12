import { expect, type Page } from '@playwright/test';

export class TopNav {
  constructor(private readonly page: Page) {}

  async gotoDashboard() {
    await this.page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  }

  async gotoExpenses() {
    await this.page.getByRole('link', { name: 'Expenses' }).click();
    await expect(this.page.getByRole('heading', { name: 'Expenses' })).toBeVisible();
  }

  async gotoImport() {
    await this.page.getByRole('link', { name: 'Import' }).click();
    await expect(this.page.getByRole('heading', { name: 'Import Expenses' })).toBeVisible();
  }

  async logout() {
    await this.page.getByRole('button', { name: 'Logout' }).click();
    await expect(this.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  }
}
