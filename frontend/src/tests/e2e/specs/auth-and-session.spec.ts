import { expect, test } from '@playwright/test';
import { LoginPage } from '../POM/pages/LoginPage';
import { TopNav } from '../POM/components/TopNav';
import { buildUniqueEmail, TEST_PASSWORD } from '../utils/testUser';

test.describe('e2e: auth and session', () => {
  test('registers via UI, reaches protected routes, and logs out', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);
    const topNav = new TopNav(page);
    const email = buildUniqueEmail('auth_ui', testInfo);

    await loginPage.goto();
    await loginPage.authForm.switchToRegisterMode();
    await loginPage.authForm.fillCredentials(email, TEST_PASSWORD);
    await loginPage.authForm.submitRegister();

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await topNav.gotoExpenses();
    await topNav.gotoImport();
    await topNav.gotoDashboard();
    await topNav.logout();
  });

  test('shows actionable error for invalid login', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);
    const email = buildUniqueEmail('auth_invalid', testInfo);

    await loginPage.goto();
    await loginPage.authForm.fillCredentials(email, 'wrong-password');
    await loginPage.authForm.submitSignIn();
    await loginPage.authForm.expectError('Invalid email or password');
  });
});
