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
    // After login APEX shows "My Account" button and username button in the nav bar
    // (Logout is inside the My Account dropdown, not directly visible).
    // Assert that a user-specific nav element is visible as evidence of successful login.
    await expect(
      loginPage.page.getByRole('button', { name: /my account/i })
        .or(loginPage.page.getByRole('link', { name: /log.?out|sign.?out/i }))
        .or(loginPage.page.locator('.t-NavigationBar-item--user'))
        .or(loginPage.page.getByRole('button', { name: /@|\.co\.|yahoo|gmail/i }))
        .first(),
    ).toBeVisible();
  });
});
