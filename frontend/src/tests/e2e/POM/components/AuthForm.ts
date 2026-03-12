import { expect, type Page } from '@playwright/test';

export class AuthForm {
  constructor(private readonly page: Page) {}

  async fillCredentials(email: string, password: string) {
    await this.page.getByLabel('Email address').fill(email);
    await this.page.getByLabel('Password').fill(password);
  }

  async submitSignIn() {
    await this.page.getByRole('button', { name: 'Sign in' }).last().click();
  }

  async submitRegister() {
    await this.page.getByRole('button', { name: 'Register' }).last().click();
  }

  async switchToRegisterMode() {
    await this.page.getByRole('button', { name: 'Register' }).first().click();
    await expect(this.page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  }

  async switchToLoginMode() {
    await this.page.getByRole('button', { name: 'Sign in' }).first().click();
    await expect(this.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  }

  async expectError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}
