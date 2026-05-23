import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config();

// Comparison config — matches Selenium WebDriver settings as closely as possible:
//   browser:   Chromium (Chrome)
//   viewport:  1280 × 900  (matches selenium-comparison driver_factory.rb --window-size=1280,900)
//   headless:  true (matches HEADLESS != 'false' guard in DriverFactory)
//   workers:   1  (serial — same as Selenium RSpec suite)
//   retries:   0  (no automatic retries — same as Selenium)
//
// Only the 7 tests that have been ported to Selenium are included.
// Timing is captured in playwright-report/comparison-results.json (duration field, ms).
//
// Run:  npx playwright test --config=playwright.comparison.config.ts

export default defineConfig({
  fullyParallel: false,
  workers:       1,
  retries:       0,
  timeout:       45_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['json', { outputFile: 'playwright-report/comparison-results.json' }],
  ],

  use: {
    baseURL:           process.env.BASE_URL,
    headless:          process.env.HEADLESS !== 'false',
    actionTimeout:     15_000,
    navigationTimeout: 30_000,
    locale:            'en-US',
    timezoneId:        'UTC',
    screenshot:        'only-on-failure',
    viewport:          { width: 1280, height: 900 },
  },

  projects: [
    // Seed must run first to save .auth/user.json for the authenticated tests
    {
      name:    'comparison-setup',
      testDir: '.',
      testMatch: /seed\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: 'comparison',
      use: {
        ...devices['Desktop Chrome'],
        viewport:     { width: 1280, height: 900 },
        storageState: '.auth/user.json',
      },
      dependencies: ['comparison-setup'],
      testMatch: [
        '**/hp-01-product-grid.spec.ts',
        '**/auth-01-happy-path.spec.ts',
        '**/auth-02-invalid-password.spec.ts',
        '**/cart-01-add-item-home.spec.ts',
        '**/chk-01-proceed-to-checkout.spec.ts',
        '**/sf-04-smart-filter-toggle.spec.ts',
        '**/pd-01-product-info-display.spec.ts',
      ],
    },
  ],
});
