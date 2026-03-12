import type { APIRequestContext, Page, TestInfo } from '@playwright/test';
import { expect } from '@playwright/test';
import { LoginPage } from '../POM/pages/LoginPage';
import { registerFreshUser, type TestAccount } from './testUser';

export async function loginWithFreshUser(
  page: Page,
  api: APIRequestContext,
  testInfo: TestInfo,
  prefix: string
): Promise<TestAccount> {
  const account = await registerFreshUser(api, prefix, testInfo);
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.authForm.fillCredentials(account.email, account.password);
  await loginPage.authForm.submitSignIn();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  return account;
}
