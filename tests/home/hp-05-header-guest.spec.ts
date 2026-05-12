// spec: specs/sanzu.plan.md
// seed: fixtures/fixtures.ts

import { test, expect } from '../../fixtures/fixtures';

test.describe('1 — Home Page', () => {
  test('HP-05 — Header elements are present in guest state', async ({ homePage, page }) => {
    // Step 1: Preconditions: guest. Navigate to /home via homePage fixture.
    await expect(page).toHaveTitle('Home');

    // Step 2: Assert homePage.header.searchInput is visible.
    // expect: Search Product textbox is visible with placeholder 'Search Product'
    await expect(homePage.header.searchInput).toBeVisible();

    // Step 3: Assert the nav list contains a 'Login' link and a 'Sign Up' link.
    // expect: Link with text 'Login' exists in the nav list
    await expect(page.getByRole('link', { name: 'Login', exact: true })).toBeVisible();
    // expect: Link with text 'Sign Up' exists in the nav list
    await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();

    // Step 4: Assert NO username button is visible (guest state only has Home, Login, Sign Up).
    // expect: No button matching the authenticated username pattern is visible in the nav list
    const navList = page.getByRole('banner').getByRole('list');
    await expect(navList.getByRole('button')).toHaveCount(0);

    // Step 5: Assert the Cart Region table is visible with Qty and Total column headers.
    // expect: table[aria-label='Cart Region'] is visible
    await expect(page.getByRole('table', { name: 'Cart Region' })).toBeVisible();
    // expect: Column headers 'Qty' and 'Total' are present
    await expect(page.getByRole('columnheader', { name: 'Qty' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total' })).toBeVisible();
    // expect: Total cell shows '0.00' for an empty session cart
    await expect(page.getByRole('link', { name: '0.00', exact: true })).toBeVisible();

    // Step 6: Click the 'Demo Organization' logo link in the header.
    // expect: Browser stays on or re-navigates to /home
    await page.getByRole('link', { name: 'Demo Organization' }).nth(1).click();
    // expect: Page title remains 'Home'
    await expect(page).toHaveTitle('Home');
    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  });
});
