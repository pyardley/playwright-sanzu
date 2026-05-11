# Page Component Object Model (PCOM)

## Audit

The PCOM pattern is applied at four distinct levels.

### 1. Abstract base layer — `BasePage` / `BaseComponent`

Both abstract classes hold the `Page` reference and shared APEX-specific behaviour (`waitForApexReady`, `dismissAlert`, `waitForNetwork`). Every page and component inherits from these — no duplication of that infrastructure.

### 2. Component layer — `components/`

Six reusable components, each scoped to a single UI concern:

| Component | Responsibility |
|---|---|
| `HeaderComponent` | Banner, search, user menu, cart widget |
| `ProductCardComponent` | A single product list item with title, price, Add to Cart |
| `SmartFilterComponent` | Collapsible filter region |
| `LoginFormComponent` | Login fields and submit |
| `CartSummaryComponent` | Cart totals and Checkout button |
| `BaseComponent` | Shared `isVisible()`, `waitFor()` |

Each component owns its own locators as `readonly` fields and exposes only typed action methods — no raw `page` calls leak into tests.

### 3. Page layer — `pages/`

Five page classes (`HomePage`, `LoginPage`, `CartPage`, `ProductDetailPage`, `CheckoutPage`) each:

- Declare their APEX URL alias via `APEX_ROOT` (defined once in `BasePage`)
- **Compose** components rather than duplicating them — `HomePage` holds `HeaderComponent`, `SmartFilterComponent`, and constructs `ProductCardComponent` instances on demand
- Expose page-level actions (`addFirstProductToCart`, `searchProducts`) that coordinate across components

### 4. Fixture layer — `fixtures/fixtures.ts`

Playwright's `test.extend` wires every page object into the test runner. Tests declare what they need as a parameter — the framework navigates and instantiates automatically. No `new` calls, no `goto` calls inside tests.

---

## How PCOM scales this project

### 1. Single point of change for locators

If Oracle APEX renames a button label or changes a page alias, you fix it in one place — the component or page class. Without PCOM, the same selector would be scattered across dozens of `test()` blocks.

Concrete example from this project: when the live snapshot revealed the cart URL was `/org-wise-cart-detail1` (not `/cart`), one line changed in `pages/CartPage.ts` and every test that uses `cartPage` was automatically correct.

### 2. Tests read like requirements, not automation scripts

```ts
// With PCOM
await homePage.addFirstProductToCart();
await homePage.header.goToCart();
expect(await cartPage.getCartRowCount()).toBeGreaterThan(0);

// Without PCOM
await page.locator('ul').filter({ has: page.getByRole('button', { name: 'Add to Cart' }) })
  .locator('li').first().getByRole('button', { name: 'Add to Cart' }).click();
await page.waitForLoadState('networkidle');
await page.getByRole('link', { name: /^\d/ }).filter({ hasText: /\.00/ }).click();
await page.waitForLoadState('networkidle');
expect(await page.locator('table tbody tr').count()).toBeGreaterThan(0);
```

The first version is reviewable by a product owner. The second is not.

### 3. Component reuse across pages

`HeaderComponent` is instantiated in `HomePage`, `CartPage`, and `ProductDetailPage`. The search flow, user menu, and cart widget are tested from multiple pages without any code duplication. Adding a fourth page that needs the header is a one-line import.

### 4. Safe parallel expansion

New pages (e.g., `OrderHistoryPage`, `ProductReviewPage`) are added by:

1. Creating a class in `pages/` extending `BasePage`
2. Adding a fixture entry in `fixtures/fixtures.ts`
3. Writing tests against the typed API

No existing file needs to change. Team members can work on different pages in parallel without merge conflicts in test files.

### 5. The Healer agent stays effective

The AI Healer targets component files, not spec files. When APEX changes a locator, the Healer patches `HeaderComponent.ts` once — all tests that depend on the header are fixed in a single operation. Without PCOM, the Healer would need to patch every individual test file.

### 6. Weakness to watch

`components/ProductCardComponent.ts` currently uses fragile title extraction (text node parsing). As more product-card tests are added, this will be the first component that benefits from a targeted locator refinement — inspect the exact DOM structure of a product `<li>` item in the live app and harden the `getTitle()` implementation accordingly.
