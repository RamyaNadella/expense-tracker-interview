import { expect, type Page } from '@playwright/test';
import { BasePage } from '../core/BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  }

  async expectSummaryVisible() {
    await expect(this.page.getByText('Total Expenses')).toBeVisible();
    await expect(this.page.getByText('Avg per Expense')).toBeVisible();
    await expect(this.page.getByText('Recent Expenses')).toBeVisible();
  }

  async expectNoNaNOrInfinity() {
    const bodyText = (await this.page.locator('body').innerText()).toString();
    expect(bodyText).not.toContain('NaN');
    expect(bodyText).not.toContain('Infinity');
  }
}
