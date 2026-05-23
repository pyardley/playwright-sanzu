# Page Object Model vs Page Component Object Model

## The key question: where does the header live?

`HeaderComponent` has **59 lines** of locators and methods. It is composed into **4 page classes**: `LoginPage`, `HomePage`, `CartPage`, and `ProductDetailPage`.

### PCOM (current approach)

Each page class has one line:

```ts
// LoginPage, HomePage, CartPage, ProductDetailPage — each
this.header = new HeaderComponent(page);   // 1 line per page
```

`HeaderComponent`'s 59 lines exist **once**. Total header-related code across all page files: **59 + 4 = 63 lines**.

### POM (traditional alternative)

In a flat POM, each page class owns all its locators directly. `LoginPage`, `HomePage`, `CartPage`, and `ProductDetailPage` would each need to declare the same header properties and methods inline:

```ts
// Repeated verbatim in LoginPage, HomePage, CartPage, ProductDetailPage:
readonly loginLink: Locator;
readonly logoutLink: Locator;
readonly signUpLink: Locator;
readonly logoLink: Locator;
readonly homeLink: Locator;
readonly searchInput: Locator;
readonly cartWidget: Locator;
readonly cartTotal: Locator;
readonly cartQtyHeader: Locator;
readonly cartTotalHeader: Locator;
readonly userMenuTrigger: Locator;
readonly myAccountBtn: Locator;
readonly navButtons: Locator;
readonly loggedInIndicator: Locator;    // 4-selector chain

// constructor assignments (14 expressions)

async search(query: string) { ... }
async goToCart() { ... }
async getCartTotal() { ... }
async openUserMenu() { ... }
async logout() { ... }
```

59 lines × 4 page classes = **236 lines** of duplicated header code.

**The component saves 173 lines** just for the header.

---

## The second case: `CartSummaryComponent`

`CartSummaryComponent` is 42 lines and is composed into `CartPage`. At first glance this looks like it only serves one page — so why not inline it?

Because `proceedToCheckout()` belongs to the *summary widget*, not to the page's row table. In a flat POM, `CartPage` would own both the row-table locators and the summary-widget locators in one undifferentiated block:

```ts
// Flat POM CartPage — everything in one constructor:
this.cartRows = ...
this.emptyCartMessage = ...
this.cartSummaryRoot = ...   // ← mixed in with unrelated row logic
this.subtotal = ...
this.total = ...
this.checkoutBtn = ...
this.emptyMessage = ...
```

The PCOM keeps them in separate scoped objects. `cartPage.cartSummary.proceedToCheckout()` makes clear the button belongs to the summary region; `cartPage.removeItemByIndex(0)` operates on a row. In a flat POM those two concerns share a namespace and a constructor.

---

## The third case: `SmartFilterComponent`

`SmartFilterComponent` is 59 lines and is composed into `HomePage`. The critical duplication it prevents is in the specs, not just the page classes.

SF-04, SF-05, and SF-06 each need to expand the filter, interact with it, and check active filters. In a flat POM, `HomePage` would have `expand()`, `selectFilterOption()`, `getActiveFilters()`, and `clearAll()` as top-level methods — but the `expand()` guard logic:

```ts
// SmartFilterComponent.ts — exists once
const expanded = await this.root.getAttribute('aria-expanded').catch(() => null);
if (expanded === 'false' || expanded === null) {
  await this.toggleBtn.click();
  await this.page.waitForLoadState('networkidle');
}
```

...would have to live on `HomePage` directly. That's fine until you add a second page with a Smart Filter. The component means that new page gets `expand()` by instantiating `SmartFilterComponent` — a flat POM would require copy-pasting the guard.

---

## Summary: line counts

| What | PCOM | Flat POM |
|---|---|---|
| Header code across all page files | 59 + 4 = **63** | 59 × 4 = **236** |
| Cart summary code in `CartPage` | delegated, **0** inline | **+42** inline |
| Smart filter code in `HomePage` | delegated, **0** inline | **+59** inline |
| Login form code in `LoginPage` | delegated, **0** inline | **+54** inline |
| **Total page-class code** | **~63** | **~391** |

The PCOM trades a flat structure for shared component files. The payoff is that the 4-selector `loggedInIndicator` chain, the `aria-expanded` guard in `expand()`, and `getError()`'s 2-stage fallback each exist in exactly one place — so a locator fix propagates to all consuming pages automatically rather than requiring 4 parallel edits.
