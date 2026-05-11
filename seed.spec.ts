import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import * as fs from 'fs';

const AUTH_FILE = '.auth/user.json';

test.describe('Seed — environment bootstrap', () => {
  test('homepage loads and is accessible', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Confirm we reached the APEX app (not the ORDS root landing page)
    await expect(page).not.toHaveTitle(/Oracle REST Data Services/i);
    await expect(home.header.navRoot).toBeVisible();
    await expect(home.productGrid).toBeVisible();
  });

  test('save authenticated session to storageState', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    // Handle cookie consent banner if present on first load
    const consentBtn = page.getByRole('button', { name: /accept|agree|ok/i });
    if (await consentBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await consentBtn.click();
    }

    await login.loginForm.fill(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!,
    );

    // Click submit then race: success redirect vs APEX throttle vs timeout.
    // Do NOT use loginForm.submit() here — its internal waitForLoadState('networkidle')
    // can resolve mid-redirect, causing page.url() to read the wrong URL.
    await login.loginForm.submitButton.click();

    const outcome = await Promise.race([
      page.waitForURL(/home|dashboard|profile/i,   { timeout: 30_000 }).then(() => 'ok'       as const),
      page.waitForURL(/notification_msg/i,          { timeout: 30_000 }).then(() => 'throttled' as const),
      page.waitForURL(/invalid|error|fail/i,        { timeout: 30_000 }).then(() => 'badcreds'  as const),
    ]).catch(() => 'timeout' as const);

    if (outcome !== 'ok') {
      const messages: Record<string, string> = {
        throttled: 'APEX blocked this login attempt (throttle active). Wait ~30 s, then retry. Also verify credentials in .env.',
        badcreds:  'Login rejected — check TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.',
        timeout:   'Login timed out. Verify credentials in .env and confirm loginPage.path alias is correct.',
      };
      throw new Error(messages[outcome]);
    }

    // APEX uses <header> (banner role), not <nav> — confirm we landed on the home page
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('button', { name: process.env.TEST_USER_EMAIL!, exact: false })).toBeVisible();

    await page.context().storageState({ path: AUTH_FILE });

    // Verify the APEX session cookie was captured
    const state = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
    const apexCookie = state.cookies.find(
      (c: { name: string }) => c.name.startsWith('ORA_WWV') || c.name.startsWith('WWV_STATE'),
    );
    if (!apexCookie) {
      console.warn('Warning: APEX session cookie not found. Login may have failed or cookie name differs.');
    }
  });
});
