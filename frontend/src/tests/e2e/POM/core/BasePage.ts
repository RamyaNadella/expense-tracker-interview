import { expect, type Locator, type Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/') {
    await this.page.goto(path);
  }

  protected async expectVisible(target: Locator | string) {
    if (typeof target === 'string') {
      await expect(this.page.getByText(target)).toBeVisible();
      return;
    }
    await expect(target).toBeVisible();
  }
}
