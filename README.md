# Playwright Sanzu — E2E Test Suite

End-to-end test suite for the **Sanzu e-commerce portal** (Oracle APEX), built with Playwright TypeScript using a Page Component Object Model (PCOM) architecture and three AI agents that plan, generate, and heal tests automatically.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| Playwright | installed via `npm install` |
| Claude Code CLI | latest (`npm install -g @anthropic-ai/claude-code`) |

```powershell
npm install
npx playwright install chromium
```

Copy `.env.example` to `.env` and fill in your credentials:

```
BASE_URL=https://<your-apex-host>
TEST_USER_EMAIL=your@email.com
TEST_USER_PASSWORD=yourpassword
```

---

## Running the tests

```powershell
# Bootstrap — creates .auth/user.json (run once, or after session expiry)
npx playwright test --project=setup

# Home page tests (guest, no auth required)
npx playwright test tests/home/ --project=chromium-guest

# All authenticated tests
npx playwright test --project=chromium-auth

# Full suite (setup → auth → guest)
npx playwright test

# Open HTML report
npx playwright show-report
```

---

## Architecture — Page Component Object Model (PCOM)

The suite is built on a four-layer PCOM that keeps all locators in one place, makes tests readable, and allows the Healer agent to fix a broken selector once and have every test that depends on it pass automatically. See [PCOM.md](PCOM.md) for the full audit.

```
BasePage / BaseComponent     shared APEX waits, page reference
        │
   components/               one class per UI concern
   ├── HeaderComponent        search, login link, cart widget, user menu
   ├── ProductCardComponent   title, prices, Add to Cart, detail link
   ├── SmartFilterComponent   collapsible filter region
   ├── LoginFormComponent     username/password fields, submit
   └── CartSummaryComponent   totals, Checkout button
        │
     pages/                  one class per APEX page alias
   ├── HomePage               /home
   ├── LoginPage              /login_desktop
   ├── CartPage               /org-wise-cart-detail1
   ├── ProductDetailPage      /product-detail-info
   └── CheckoutPage           /checkout
        │
   fixtures/fixtures.ts       test.extend — injects page objects into every test
```

Tests declare what they need as a parameter and the framework navigates automatically:

```ts
import { test, expect } from '../../fixtures/fixtures';

test('cart shows added item', async ({ homePage, cartPage }) => {
  await homePage.addFirstProductToCart();
  await homePage.header.goToCart();
  expect(await cartPage.getCartRowCount()).toBeGreaterThan(0);
});
```

---

## How the test suite was created

The suite is built using three Claude Code AI agents that work in sequence. Each agent is defined under [.claude/agents/](.claude/agents/) and is invoked from the terminal using the Claude Code CLI.

### Step 1 — Planner (`@playwright-test-planner`)

The Planner browses the live application, maps all user flows and edge cases, and writes a structured Markdown test plan.

```powershell
Get-Content .\specs\planner-prompt.txt -Raw | claude `
  --allowedTools "mcp__playwright-test__*,Glob,Grep,Read,LS" `
  -p "@playwright-test-planner Follow the instructions in the piped content"
```

**Output:** `specs/sanzu.plan.md` — 44 test cases across 6 areas with step-by-step actions, PCOM method references, and APEX-specific notes.

---

### Step 2 — Generator (`@playwright-test-generator`)

The Generator reads the plan, physically executes each step in a real browser, records the interactions, then writes a typed TypeScript spec file per test case.

```powershell
Get-Content .\specs\generator-prompt.txt -Raw | claude `
  --allowedTools "mcp__playwright-test__*,Glob,Grep,Read,LS" `
  -p "@playwright-test-generator Follow the instructions in the piped content"
```

To generate one area at a time (recommended for long plans):

```powershell
Get-Content .\specs\generator-prompt.txt -Raw | claude `
  --allowedTools "mcp__playwright-test__*,Glob,Grep,Read,LS" `
  -p "@playwright-test-generator Follow the piped instructions but generate Area 2 (Search and Filtering) only"
```

**Output:** one `.spec.ts` file per test case, placed in the path specified by the plan's `File:` field.

---

### Step 3 — Healer (`@playwright-test-healer`)

The Healer runs the full suite, pauses at each failure, inspects the live DOM, identifies the broken selector or assertion, and edits the component or spec to fix it. It then re-runs to verify before moving to the next failure.

```powershell
Get-Content .\specs\healer-prompt.txt -Raw | claude `
  --allowedTools "mcp__playwright-test__*,Glob,Grep,Read,LS,Edit,Write" `
  -p "@playwright-test-healer Follow the instructions in the piped content"
```

To target a single project:

```powershell
Get-Content .\specs\healer-prompt.txt -Raw | claude `
  --allowedTools "mcp__playwright-test__*,Glob,Grep,Read,LS,Edit,Write" `
  -p "@playwright-test-healer Follow the piped instructions but only heal the chromium-guest project"
```

> **Note:** The healer requires `Edit` and `Write` in `--allowedTools` so it can modify source files. It will not remove `waitForLoadState('networkidle')` calls — those are intentional APEX synchronisation guards.

---

## Current test coverage

| Area | Tests in plan | Spec files generated | Status |
|------|:---:|---|---|
| 1 — Home Page | 8 | `tests/home/hp-01` … `hp-08` | ✅ Generated & healed |
| 2 — Search and Filtering | 8 | `tests/search/sf-01` … `sf-08` | ⬜ Not yet generated |
| 3 — Authentication | 6 | `tests/auth/auth-01` … `auth-06` | ⬜ Not yet generated |
| 4 — Product Detail | 7 | `tests/product-detail/pd-01` … `pd-07` | ⬜ Not yet generated |
| 5 — Cart Management | 8 | `tests/cart/cart-01` … `cart-08` | ⬜ Not yet generated |
| 6 — Checkout | 7 | `tests/checkout/chk-01` … `chk-07` | ⬜ Not yet generated |
| **Total** | **44** | | |

Placeholder specs also exist for `tests/auth/login.spec.ts`, `tests/cart/cart.spec.ts`, and `tests/checkout/checkout.spec.ts` from the initial project setup.

---

## Building out the remaining test areas

Run the Generator for each remaining area in order, then run the Healer once after all areas are generated.

### Area 2 — Search and Filtering (SF-01 to SF-08)

```powershell
Get-Content .\specs\generator-prompt.txt -Raw | claude `
  --allowedTools "mcp__playwright-test__*,Glob,Grep,Read,LS" `
  -p "@playwright-test-generator Follow the piped instructions but generate Area 2 (Search and Filtering) only"
```

Expected output: `tests/search/sf-01-search-by-name.spec.ts` … `sf-08-…spec.ts`

> All SF tests run under `chromium-auth` — search requires authentication on this APEX app.

---

### Area 3 — Authentication (AUTH-01 to AUTH-06)

```powershell
Get-Content .\specs\generator-prompt.txt -Raw | claude `
  --allowedTools "mcp__playwright-test__*,Glob,Grep,Read,LS" `
  -p "@playwright-test-generator Follow the piped instructions but generate Area 3 (Authentication) only"
```

Expected output: `tests/auth/auth-01-login-happy-path.spec.ts` … `auth-06-…spec.ts`

> **Important:** AUTH-02 (invalid credentials) must include `test.retry(0)` — the Healer will add this if the Generator misses it. APEX throttles repeated failed logins.

---

### Area 4 — Product Detail (PD-01 to PD-07)

```powershell
Get-Content .\specs\generator-prompt.txt -Raw | claude `
  --allowedTools "mcp__playwright-test__*,Glob,Grep,Read,LS" `
  -p "@playwright-test-generator Follow the piped instructions but generate Area 4 (Product Detail Page) only"
```

Expected output: `tests/product-detail/pd-01-…spec.ts` … `pd-07-…spec.ts`

---

### Area 5 — Cart Management (CART-01 to CART-08)

```powershell
Get-Content .\specs\generator-prompt.txt -Raw | claude `
  --allowedTools "mcp__playwright-test__*,Glob,Grep,Read,LS" `
  -p "@playwright-test-generator Follow the piped instructions but generate Area 5 (Cart Management) only"
```

Expected output: `tests/cart/cart-01-…spec.ts` … `cart-08-…spec.ts`

> Cart tests run under `chromium-auth`. Cart detail URL requires query param `?p42_pid_org=1`.

---

### Area 6 — Checkout (CHK-01 to CHK-07)

```powershell
Get-Content .\specs\generator-prompt.txt -Raw | claude `
  --allowedTools "mcp__playwright-test__*,Glob,Grep,Read,LS" `
  -p "@playwright-test-generator Follow the piped instructions but generate Area 6 (Checkout) only"
```

Expected output: `tests/checkout/chk-01-…spec.ts` … `chk-07-…spec.ts`

---

### After all areas are generated — run the Healer

```powershell
Get-Content .\specs\healer-prompt.txt -Raw | claude `
  --allowedTools "mcp__playwright-test__*,Glob,Grep,Read,LS,Edit,Write" `
  -p "@playwright-test-healer Follow the instructions in the piped content"
```

---

## MCP server

The Playwright MCP server is configured in [.mcp.json](.mcp.json). Claude Code starts it automatically when you open a CLI session in this directory. All three agents depend on it for browser tools (`browser_snapshot`, `browser_navigate`, etc.) and test tools (`test_run`, `test_debug`, `generator_write_test`, `planner_save_plan`).

If an agent reports that MCP tools are unavailable, close and reopen your Claude Code terminal to allow it to pick up `.mcp.json`.

---

## Project structure

```
.
├── .claude/agents/             Claude Code sub-agent definitions
│   ├── playwright-test-planner.md
│   ├── playwright-test-generator.md
│   └── playwright-test-healer.md
├── .mcp.json                   Playwright MCP server config
├── components/                 PCOM component layer
├── pages/                      PCOM page layer
├── fixtures/fixtures.ts        Playwright test.extend wiring
├── specs/
│   ├── sanzu.plan.md           Master test plan (44 test cases)
│   ├── planner-prompt.txt      Prompt for @playwright-test-planner
│   ├── generator-prompt.txt    Prompt for @playwright-test-generator
│   └── healer-prompt.txt       Prompt for @playwright-test-healer
├── tests/
│   ├── home/                   Area 1 — generated (hp-01 to hp-08)
│   ├── search/                 Area 2 — not yet generated
│   ├── auth/                   Area 3 — not yet generated
│   ├── product-detail/         Area 4 — not yet generated
│   ├── cart/                   Area 5 — not yet generated
│   └── checkout/               Area 6 — not yet generated
├── seed.spec.ts                Auth bootstrap (saves .auth/user.json)
├── playwright.config.ts
├── PCOM.md                     PCOM architecture audit
└── README.md
```
