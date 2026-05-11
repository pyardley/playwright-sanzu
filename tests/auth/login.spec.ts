import { test, expect } from '../../fixtures/fixtures';

test.describe('Authentication', () => {
  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginForm.fill('invalid@example.com', 'WrongPassword!');
    await loginPage.loginForm.submit();

    const error = await loginPage.loginForm.getError();
    expect(error).toBeTruthy();
  });

  test('should redirect to home after successful login', async ({ loginPage }) => {
    await loginPage.loginAs(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!,
    );
    await expect(loginPage.page).toHaveURL(/home|dashboard/i);
  });

  test('should show logout link after login', async ({ loginPage }) => {
    await loginPage.loginAs(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!,
    );
    // User menu or logout must be reachable
    await expect(
      loginPage.page.getByRole('link', { name: /log.?out|sign.?out/i })
        .or(loginPage.page.locator('.t-NavigationBar-item--user')),
    ).toBeVisible();
  });
});
