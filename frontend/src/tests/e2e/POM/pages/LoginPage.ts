import { expect, type Page } from '@playwright/test';
import { BasePage } from '../core/BasePage';
import { AuthForm } from '../components/AuthForm';

export class LoginPage extends BasePage {
  readonly authForm: AuthForm;

  constructor(page: Page) {
    super(page);
    this.authForm = new AuthForm(page);
  }

  async goto() {
    await super.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  }
}
