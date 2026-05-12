You are planning tests for the Sanzu e-commerce portal — an Oracle APEX application
for "Demo Organization" selling consumer electronics (phones, headphones, earbuds).

BASE URL: defined in the `.env` file (`BASE_URL`).

CONFIRMED PAGE ALIASES (explore these, do not guess others):
/home — product listing (home page)
/login_desktop — login form
/product-detail-info — product detail (query param: ?pid_product=N)
/org-wise-cart-detail1 — cart detail (query param: ?p42_pid_org=1)

CONFIRMED UI STRUCTURE FROM LIVE SNAPSHOTS:

Header (ARIA role: banner):

- Logo + org name link → /home
- Search textbox (placeholder: "Search Product") + submit
- Nav list: link "Home" | button "My Account" | button "<USERNAME>" (logged-in only)

Home page:

- "Discount Offer / HOT" strip — product links only (no Add to Cart)
- "Offer ends.." product list — <li> items each with:
  - Countdown timer (Days / Hrs / Min / Sec)
  - Product image link → /product-detail-info?pid_product=N
  - Original price (strikethrough) + sale price
  - Discount % heading (e.g. "15% Discount")
  - Product name + SKU ID
  - button "Add to Cart" (triggers APEX JS: $s('P1_ADD_PRODUCT', N))
  - Star rating
- Sidebar: table "Cart Region" (Qty / Total columns) — total is a link → /org-wise-cart-detail1
- region "Smart Filter" (collapsible)
- region "Admin Login" (separate admin portal — DO NOT test this)
- region "Chatbox"

Products in the catalogue:
Samsung (34,000 / 15% off), Honor X6b (123,500 / 5% off),
Infinix Hot 40 Pro (27,000 / 10% off), infinix Hot 50 Pro (32,900 / 6% off),
Honor X8b (34,000 / 15% off), iPhone 16 Pro Max (84,000 / 30% off),
Infinix Note 40s (27,000 / 10% off), TWS Pro Bluetooth Earbuds (720 / 10% off),
Awei AT7 Headphone (850 / 15% off), HD Stereo Wired headphones (400 / 20% off),
Redmi 15 8GB+256GB (19,999 / no discount)

Authentication:

- Credentials supplied via environment variables (TEST_USER_EMAIL, TEST_USER_PASSWORD)
- Authenticated session is pre-saved to .auth/user.json (storageState)
- After login, username appears as a button in the nav list
- APEX throttles repeated failed logins — plan for this in negative auth tests

PCOM STRUCTURE ALREADY IN PLACE (reference these in your plans):
pages/ → HomePage, LoginPage, CartPage, ProductDetailPage, CheckoutPage
components/→ HeaderComponent, ProductCardComponent, SmartFilterComponent,
LoginFormComponent, CartSummaryComponent

OUTPUT: one Markdown file per scenario group, saved to ./test-plans/
Use this naming convention: 01-guest-browsing.md, 02-search-filter.md, etc.

For each test case document:

- Preconditions (guest or authenticated, cart state)
- Step-by-step actions using PCOM method names where possible
  (e.g. "homePage.addFirstProductToCart()", "homePage.header.goToCart()")
- Expected outcomes
- APEX-specific notes (AJAX waits, dynamic IDs to avoid, throttle risks)
- Suggested locator if a new one is needed

Explore and plan positive and negative tests for the following areas:

1. **Home page** — product grid display, product card data (name, price),
   navigation to product detail, header elements (search, login link, cart widget)
2. **Search and filtering** — keyword search via the Search Product input,
   Smart Filter region (category/price facets), no-results state
3. **Authentication** — login happy path, invalid credentials error, logout
4. **Product detail page** — product information display, Add to Cart from
   detail page, navigation back to home
5. **Cart management** — add item, cart total update, view cart detail page,
   remove item, empty cart state
6. **Checkout** — proceed to checkout from cart, form fields, submission

For each scenario assume a blank/fresh browser state as the starting condition.
The seed file handles authentication setup — tests that require a logged-in
user should note that dependency.

Save the completed plan to `specs/sanzu.plan.md`.
