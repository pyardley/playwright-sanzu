import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config();

// Comparison config — runs the 7 tests that have Selenium counterparts.
//   browser:   Chromium (Chrome)
//   viewport:  1280 × 900  (matches selenium-comparison driver_factory.rb --window-size=1280,900)
//   headless:  true (matches HEADLESS != 'false' guard in DriverFactory)
//   workers:   4  (parallel — balances speed vs remote APEX server load)
//   retries:   0  (no automatic retries — same as Selenium)
//
// All 7 tests are safe to parallelise: CART-01 and CHK-01 each call
// loginPage.loginAs(), giving each test its own APEX session with isolated cart state.
// Timing is captured in playwright-report/comparison-results.json (duration field, ms).
//
// Run:  npx playwright test --config=playwright.comparison.config.ts

export default defineConfig({
  fullyParallel: true,
  workers: 4,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },

  reporter: [
    ["list"],
    ["json", { outputFile: "playwright-report/comparison-results.json" }],
  ],

  use: {
    baseURL: process.env.BASE_URL,
    headless: process.env.HEADLESS !== "false",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: "en-US",
    timezoneId: "UTC",
    screenshot: "only-on-failure",
    viewport: { width: 1280, height: 900 },
  },

  projects: [
    // Seed must run first to save .auth/user.json for the authenticated tests
    {
      name: "comparison-setup",
      testDir: ".",
      testMatch: /seed\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: "comparison",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
        storageState: ".auth/user.json",
      },
      dependencies: ["comparison-setup"],
      testMatch: [
        "**/hp-01-product-grid.spec.ts",
        "**/auth-01-happy-path.spec.ts",
        "**/auth-02-invalid-password.spec.ts",
        "**/cart-01-add-item-home.spec.ts",
        "**/chk-01-proceed-to-checkout.spec.ts",
        "**/sf-04-smart-filter-toggle.spec.ts",
        "**/pd-01-product-info-display.spec.ts",
      ],
    },
  ],
});
