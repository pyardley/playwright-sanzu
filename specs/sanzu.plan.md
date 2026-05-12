# Sanzu E-commerce Portal — Test Plan

## Application Overview

Sanzu E-commerce Portal is an Oracle APEX application (app ID 111, root /ords/r/sanjay_sikder/ecommerceportal) operated by "Demo Organization" selling consumer electronics — smartphones, headphones, and earbuds. The application uses APEX AJAX for cart operations and a faceted Smart Filter. Authentication is session-based; unauthenticated users are redirected to /login_desktop for cart, search, and checkout actions. The PCOM layer (pages/, components/, fixtures/) abstracts all locators; tests must use PCOM method calls rather than raw page.locator() calls. Authenticated tests depend on .auth/user.json storageState produced by a global setup. APEX throttles repeated failed login attempts, so negative authentication tests must be designed to minimise consecutive failures against the same account.

## Test Scenarios

### 1. 1 — Home Page

**Seed:** `fixtures/fixtures.ts`

#### 1.1. HP-01 — Product grid renders all catalogue items

**File:** `tests/home/hp-01-product-grid.spec.ts`

**Steps:**
  1. Preconditions: guest (no storageState). Navigate to /home via homePage fixture (calls homePage.goto()).
    - expect: Page title is 'Home'
    - expect: URL contains /home
  2. Call homePage.waitForProducts() and then homePage.getProductCards() to retrieve all product card components.
    - expect: The returned array contains exactly 11 items matching the known catalogue (Samsung, Honor X6b, Infinix Hot 40 Pro, infinix Hot 50 Pro, Honor X8b, iPhone 16 Pro Max, Infinix Note 40s, TWS Pro Bluetooth Earbuds, Awei AT7 Headphone, HD Stereo Wired headphones, Redmi 15)
  3. For each card call card.getTitle() and card.getOriginalPrice() and card.getSalePrice().
    - expect: getTitle() returns a non-empty string
    - expect: getSalePrice() returns a non-empty string with numeric content
    - expect: For products with a discount, getOriginalPrice() is non-empty and greater than getSalePrice()
  4. Assert the Discount Offer / HOT strip is visible via homePage.discountOfferStrip.isVisible().
    - expect: Strip is visible and contains at least one product link

#### 1.2. HP-02 — Discount Offer strip contains product links only (no Add to Cart)

**File:** `tests/home/hp-02-discount-strip.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /home via homePage fixture.
  2. Locate the Discount Offer strip via homePage.discountOfferStrip.
    - expect: Strip heading text includes 'Discount Offer' and 'HOT'
  3. Assert that no 'Add to Cart' button is present inside homePage.discountOfferStrip.
    - expect: getByRole('button', { name: 'Add to Cart' }) within the strip returns count 0
  4. Click the first product link inside the strip (e.g. Samsung link with href containing pid_product=1).
    - expect: Browser navigates to /product-detail-info?pid_product=1
    - expect: Page title is 'Product Detail Info'

#### 1.3. HP-03 — Countdown timers display on discounted product cards

**File:** `tests/home/hp-03-countdown-timers.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /home via homePage fixture.
  2. Locate the product list (homePage.productGrid) and check the first list item for the presence of 'Offer ends..' text and numeric Days / Hrs / Min / Sec sub-elements.
    - expect: Text 'Offer ends..' is visible
    - expect: Four numeric counters (Days, Hrs, Min, Sec) are visible and contain digit strings
  3. Assert the Redmi 15 card (no discount, pid_product=13) does NOT show the 'Offer ends..' countdown.
    - expect: The Redmi 15 list item heading does not include countdown text

#### 1.4. HP-04 — Star rating and review count are visible on product cards

**File:** `tests/home/hp-04-star-ratings.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /home via homePage fixture.
  2. For each product card in homePage.getProductCards(), locate the review paragraph (text matches pattern '(N / 5 from N reviews)').
    - expect: Each card shows a review paragraph matching the pattern '(N / 5 from N reviews)'

#### 1.5. HP-05 — Header elements are present in guest state

**File:** `tests/home/hp-05-header-guest.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /home via homePage fixture.
  2. Assert homePage.header.searchInput is visible using await homePage.header.searchInput.isVisible().
    - expect: Search Product textbox is visible with placeholder 'Search Product'
  3. Assert the nav list contains a 'Login' link and a 'Sign Up' link.
    - expect: Link with text 'Login' exists in the nav list
    - expect: Link with text 'Sign Up' exists in the nav list
  4. Assert NO username button is visible (guest state only has Home, Login, Sign Up).
    - expect: No button matching the authenticated username pattern is visible in the nav list
  5. Assert the Cart Region table is visible in the sidebar with Qty and Total column headers.
    - expect: table[aria-label='Cart Region'] is visible
    - expect: Column headers 'Qty' and 'Total' are present
    - expect: Total cell shows '0.00' for an empty session cart
  6. Click the 'Demo Organization' logo link in the header (homePage.header.navRoot).
    - expect: Browser stays on or re-navigates to /home
    - expect: Page title remains 'Home'

#### 1.6. HP-06 — Cart total link navigates to cart detail page (guest is redirected to login)

**File:** `tests/home/hp-06-cart-link-guest.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /home via homePage fixture.
  2. Locate the Cart Region total link (homePage.header.cartTotal, link text '0.00') and click it.
    - expect: Browser redirects to /login_desktop because the cart detail page requires authentication
    - expect: Page title is 'LOGIN'

#### 1.7. HP-07 — Add to Cart button redirects guest user to login

**File:** `tests/home/hp-07-add-to-cart-guest.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /home via homePage fixture.
  2. Click the first 'Add to Cart' button (homePage.addFirstProductToCart()). APEX note: button is wrapped in an anchor with a login redirect href; clicking will not trigger $s() AJAX but will redirect to login instead.
    - expect: Browser navigates to /login_desktop
    - expect: Page title is 'LOGIN'
    - expect: No cart update occurs

#### 1.8. HP-08 — Navigating to product detail from product image link

**File:** `tests/home/hp-08-product-detail-nav.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /home via homePage fixture.
  2. From homePage.productGrid, click the 'Product Pic' image link of the first list item (Samsung, pid_product=1). Use page.getByRole('link', { name: 'Product Pic' }).first().click() or ProductCardComponent.clickDetailLink().
    - expect: Browser navigates to /product-detail-info with query param pid_product=1
    - expect: Page title is 'Product Detail Info'

### 2. 2 — Search and Filtering

**Seed:** `fixtures/fixtures.ts`

#### 2.1. SF-01 — Search by product name returns matching results (authenticated)

**File:** `tests/search/sf-01-search-by-name.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture.
  2. Call homePage.header.search('iPhone') which fills the 'Search Product' textbox and presses Enter.
    - expect: Page remains on /home or refreshes with search state
    - expect: APEX AJAX wait resolves (waitForLoadState('networkidle'))
  3. Call homePage.getProductCards() and assert results.
    - expect: Only product cards whose names include 'iPhone' (i.e. iPhone 16 Pro Max) are returned in the product list
    - expect: Other products (Samsung, Infinix, etc.) are not present

#### 2.2. SF-02 — Search redirects unauthenticated user to login

**File:** `tests/search/sf-02-search-guest-redirect.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /home via homePage fixture.
  2. Call homePage.header.search('Samsung') — fills the textbox and presses Enter.
    - expect: Browser navigates to /login_desktop
    - expect: Page title is 'LOGIN'
    - expect: Note: APEX search on this app requires an authenticated session; guest users are redirected

#### 2.3. SF-03 — Search with no-match term shows empty state (authenticated)

**File:** `tests/search/sf-03-search-no-results.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture.
  2. Call homePage.header.search('ZZZNOMATCH99999').
    - expect: waitForLoadState('networkidle') resolves
  3. Assert homePage.noResultsMessage is visible, OR assert homePage.getProductCards() returns an empty array.
    - expect: Either a no-results message is shown or the product grid contains zero items
    - expect: No JavaScript error is thrown

#### 2.4. SF-04 — Smart Filter expands and collapses on toggle

**File:** `tests/search/sf-04-smart-filter-toggle.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /home via homePage fixture.
  2. Assert the Smart Filter region (homePage.smartFilter.root) is initially collapsed (CSS class 'is-collapsed' is present; content div has display:none).
    - expect: Smart Filter body is not visible / collapsed on page load
  3. Call homePage.smartFilter.expand() which clicks the 'Smart Filter' button (homePage.smartFilter.toggleBtn).
    - expect: APEX collapsible region animates open
    - expect: The 'is-collapsed' class is removed from the region element
    - expect: The region body becomes visible
  4. Click the Smart Filter toggle button again to collapse.
    - expect: Region returns to collapsed state
    - expect: 'is-collapsed' class is reapplied

#### 2.5. SF-05 — Smart Filter by category narrows product list (authenticated)

**File:** `tests/search/sf-05-smart-filter-category.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture.
  2. Call homePage.smartFilter.expand() to open the filter panel.
    - expect: Smart Filter body is visible
  3. Call homePage.smartFilter.selectFilterOption(categoryLabel) where categoryLabel is a known category option rendered by APEX (e.g. a headphone or phone category). APEX note: the hidden input ID is P1_PID_CATEGORY; the facet chips are rendered dynamically after expand. Await waitForLoadState('networkidle') after selection.
    - expect: A filter chip is added (homePage.smartFilter.getActiveFilters() returns a non-empty array)
    - expect: Product list updates via APEX AJAX to show only products in that category
  4. Call homePage.smartFilter.clearAll().
    - expect: Active filter chips are removed
    - expect: Full product list is restored (count returns to 11)

#### 2.6. SF-06 — Smart Filter by price range narrows product list (authenticated)

**File:** `tests/search/sf-06-smart-filter-price.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture.
  2. Call homePage.smartFilter.expand(). Locate the price range facet (hidden input P1_PRICE_RANGE1) and select a low-price range option (e.g. products under 1,000).
    - expect: Filter chip for the price range appears in active filters
  3. Call homePage.getProductCards() and inspect each card's getSalePrice().
    - expect: All returned products have a sale price within the selected range
    - expect: High-price products (e.g. iPhone 16 Pro Max at 84,000) are not shown
  4. Call homePage.smartFilter.clearAll() to reset.
    - expect: All 11 products are shown again

#### 2.7. SF-07 — Search with partial and case-insensitive term (authenticated)

**File:** `tests/search/sf-07-search-partial-case.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture.
  2. Call homePage.header.search('infinix') (all lowercase).
    - expect: Products with 'Infinix' or 'infinix' in their name are returned (Infinix Hot 40 Pro, infinix Hot 50 Pro, Infinix Note 40s)
    - expect: Search is case-insensitive
  3. Call homePage.header.search('head') (partial match for headphones).
    - expect: Products containing 'head' in their name are returned (Awei AT7 Headphone, HD Stereo Wired headphones)

#### 2.8. SF-08 — Search with special characters does not crash the page (authenticated)

**File:** `tests/search/sf-08-search-special-chars.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture.
  2. Call homePage.header.search("<script>alert('xss')</script>").
    - expect: Page does not execute any injected script
    - expect: Either a no-results state is shown or APEX sanitises the input
    - expect: No unhandled JavaScript error is thrown

### 3. 3 — Authentication

**Seed:** `fixtures/fixtures.ts`

#### 3.1. AUTH-01 — Successful login with valid credentials redirects to home

**File:** `tests/auth/auth-01-happy-path.spec.ts`

**Steps:**
  1. Preconditions: guest (no storageState). Instantiate loginPage via loginPage fixture (does NOT auto-navigate).
  2. Call loginPage.goto() to navigate to /login_desktop.
    - expect: Page title is 'LOGIN'
    - expect: Username textbox and Password textbox are visible
    - expect: LOGIN button is visible
  3. Call loginPage.loginAs(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD).
    - expect: loginForm.fill() populates Username and Password fields
    - expect: loginForm.submit() clicks the LOGIN button
    - expect: Page redirects to a URL matching /home
    - expect: Page title becomes 'Home'
  4. Assert the authenticated username button is visible in the header nav list.
    - expect: A button element in the nav list shows the authenticated user's name
    - expect: 'Login' link is no longer present in the nav

#### 3.2. AUTH-02 — Login with invalid password shows error message

**File:** `tests/auth/auth-02-invalid-password.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /login_desktop via loginPage.goto(). APEX throttle note: use a different invalid email address (not TEST_USER_EMAIL) to avoid throttling the real account.
  2. Call loginPage.loginForm.fill('invalid@example.com', 'WrongPassword123!').
  3. Call loginPage.loginForm.submit() and await waitForLoadState('networkidle').
    - expect: Page stays on /login_desktop (no redirect to /home)
    - expect: An error element matching .t-Alert--danger, #APEX_ERROR_MESSAGE, or .apex-error becomes visible
    - expect: Error message text is non-empty (e.g. 'Invalid Login Credentials')
  4. Assert loginPage.loginForm.getError() returns a non-null string.
    - expect: getError() returns a truthy string

#### 3.3. AUTH-03 — Login with blank credentials shows validation error

**File:** `tests/auth/auth-03-blank-credentials.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /login_desktop via loginPage.goto().
  2. Call loginPage.loginForm.submit() without calling fill() (both fields remain empty).
  3. Assert an error or validation message appears.
    - expect: Page stays on /login_desktop
    - expect: Error or browser/APEX validation message is visible for empty Username or Password fields

#### 3.4. AUTH-04 — Login with valid email but wrong password does not throttle on first attempt

**File:** `tests/auth/auth-04-wrong-password-real-email.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /login_desktop via loginPage.goto(). APEX throttle risk: run this test in isolation. Do NOT chain multiple failures against TEST_USER_EMAIL.
  2. Call loginPage.loginForm.fill(process.env.TEST_USER_EMAIL, 'DefinitelyWrong!XYZ').
  3. Call loginPage.loginForm.submit().
    - expect: Page stays on /login_desktop
    - expect: Error message is displayed
    - expect: Page does not freeze or throw a 500 error

#### 3.5. AUTH-05 — Logout clears session and returns to login or home as guest

**File:** `tests/auth/auth-05-logout.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture.
    - expect: Username button is visible in the nav list
  2. Call homePage.header.openUserMenu() — clicks the last button in the header nav list (the username button).
    - expect: A dropdown or sub-menu opens containing a logout option
  3. Call homePage.header.logout() — clicks the logout link.
    - expect: Browser navigates to /login_desktop or /home in guest mode
    - expect: The username button is no longer visible in the nav
    - expect: 'Login' link reappears in the nav list

#### 3.6. AUTH-06 — Login page links to Sign Up and Forgot Password

**File:** `tests/auth/auth-06-login-page-links.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /login_desktop via loginPage.goto().
    - expect: Page title is 'LOGIN'
  2. Assert the 'Sign Up' link is present and points to the sign-up modal dialog URL.
    - expect: Link with text 'Sign Up' is visible
  3. Assert the 'Forgot Password?' link is present.
    - expect: Link with text 'Forgot Password?' is visible
  4. Assert the 'Sanzu E-commerce' heading link navigates back to /home.
    - expect: Link with text 'Sanzu E-commerce' has href ending in /home

### 4. 4 — Product Detail Page

**Seed:** `fixtures/fixtures.ts`

#### 4.1. PD-01 — Product detail page displays full product information

**File:** `tests/product/pd-01-product-info-display.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /product-detail-info?pid_product=1 by calling productDetailPage.goto() (or page.goto(productDetailPage.path + '?pid_product=1')).
    - expect: Page title is 'Product Detail Info'
  2. Assert productDetailPage.productName is visible. Verify its text content matches 'Samsung'.
    - expect: Product name text is visible and equals 'Samsung'
  3. Assert a price is displayed. Locate the detail table row for 'Price' (row text includes 'Price-মূল্য') and assert its value cell shows '40,000.00'.
    - expect: Full (undiscounted) price '40,000.00' is shown in the product details table
  4. Assert the product image is visible (link containing an img element near the Add To Cart button).
    - expect: Product image is rendered and visible
  5. Assert the Review List table is visible with column headers: 'Client User', 'Review Message', 'Review Date', 'User Rating'.
    - expect: Review table is present
    - expect: Samsung has at least 2 existing review rows
  6. Assert the Statistics region is visible showing 'Product Rate', 'Total Chatting or Query', and 'Total Review' rows.
    - expect: Statistics table is visible with expected rows
  7. Assert the Rating Chart region is visible (contains an application/data-visualization element).
    - expect: Rating Chart region is present

#### 4.2. PD-02 — Add To Cart button on detail page redirects guest to login

**File:** `tests/product/pd-02-add-to-cart-guest.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /product-detail-info?pid_product=1.
    - expect: Page title is 'Product Detail Info'
  2. Assert productDetailPage.addToCartBtn is visible ('Add To Cart' button).
    - expect: Button 'Add To Cart' is visible
  3. Click productDetailPage.addToCartBtn. APEX note: in guest state the button may trigger an APEX login redirect rather than the AJAX cart update.
    - expect: Browser navigates to /login_desktop OR an APEX authentication challenge appears
    - expect: No cart update occurs for the guest session

#### 4.3. PD-03 — Add To Cart from detail page updates cart sidebar (authenticated)

**File:** `tests/product/pd-03-add-to-cart-authenticated.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /product-detail-info?pid_product=1.
    - expect: Page title is 'Product Detail Info'
  2. Note the current cart total in the sidebar Cart Region (homePage.header.getCartTotal() equivalent — use page.getByRole('table', {name: 'Cart Region'}).locator('cell').last().textContent()).
  3. Set quantity: call productDetailPage.setQuantity(1) to ensure the Quantity textbox shows '1'.
    - expect: Quantity input shows '1'
  4. Call productDetailPage.addToCart().
    - expect: waitForLoadState('networkidle') resolves
    - expect: Cart Region sidebar total updates to a value greater than 0.00
    - expect: No error dialog appears

#### 4.4. PD-04 — Setting quantity > 1 before Add To Cart increases line total (authenticated)

**File:** `tests/product/pd-04-quantity-input.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /product-detail-info?pid_product=11 (TWS Pro Bluetooth Earbuds, sale price 720.00).
  2. Call productDetailPage.setQuantity(2).
    - expect: Quantity textbox value is '2'
  3. Call productDetailPage.addToCart().
    - expect: Cart Region sidebar total reflects 2 × 720.00 = 1,440.00 or cumulative total including any previous items
    - expect: No error occurs

#### 4.5. PD-05 — Navigating to a non-existent product ID shows error or empty state

**File:** `tests/product/pd-05-invalid-product-id.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate directly to /product-detail-info?pid_product=99999 (an ID that does not exist).
  2. Assert the page either shows an empty product detail (blank name, no price) or an APEX error message.
    - expect: Page loads without a 500 server error
    - expect: Product name element is empty or not present
    - expect: OR an appropriate 'not found' / error message is displayed by APEX

#### 4.6. PD-06 — Home navigation from detail page header returns to home

**File:** `tests/product/pd-06-home-navigation.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /product-detail-info?pid_product=3 (iPhone 16 Pro Max).
    - expect: Page title is 'Product Detail Info'
  2. Click the 'Home' nav link in the header (productDetailPage.header.navRoot link 'Home').
    - expect: Browser navigates to /home
    - expect: Page title is 'Home'

#### 4.7. PD-07 — Demo Organization logo link in detail page header returns to home

**File:** `tests/product/pd-07-logo-link.spec.ts`

**Steps:**
  1. Preconditions: guest. Navigate to /product-detail-info?pid_product=1.
  2. Click the 'Demo Organization' logo link in the banner.
    - expect: Browser navigates to /home
    - expect: Page title is 'Home'

### 5. 5 — Cart Management

**Seed:** `fixtures/fixtures.ts`

#### 5.1. CART-01 — Adding a product from home page updates cart sidebar total (authenticated)

**File:** `tests/cart/cart-01-add-item-home.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture.
  2. Note the initial cart total via homePage.header.getCartTotal().
    - expect: Initial total is '0.00' for a fresh session
  3. Call homePage.addFirstProductToCart(). APEX note: this triggers $s('P1_ADD_PRODUCT', N) via AJAX; await waitForLoadState('networkidle') is called inside the method.
    - expect: No redirect to /login_desktop occurs
    - expect: Cart Region sidebar total increases from '0.00' to a positive value
  4. Call homePage.header.getCartTotal() again.
    - expect: New total is greater than '0.00'
    - expect: Total matches the sale price of the first product in the list

#### 5.2. CART-02 — Cart sidebar total link navigates to cart detail page (authenticated)

**File:** `tests/cart/cart-02-cart-link-authenticated.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture and call homePage.addFirstProductToCart().
    - expect: Cart total is positive
  2. Call homePage.header.goToCart() — clicks the cart total link.
    - expect: Browser navigates to /org-wise-cart-detail1?p42_pid_org=1
    - expect: Page loads successfully (not redirected to login)
  3. Assert cartPage.getCartRowCount() > 0.
    - expect: At least one row exists in the cart table

#### 5.3. CART-03 — Cart detail page shows correct product name and quantity

**File:** `tests/cart/cart-03-cart-detail-content.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home, call homePage.addFirstProductToCart(), then call homePage.header.goToCart().
    - expect: Cart detail page is shown
  2. Inspect the first cart row (cartPage.cartRows.first()). Assert the row contains the product name and a quantity value.
    - expect: First cart row is visible
    - expect: Row text includes the name of the first product added
    - expect: Quantity column shows a numeric value >= 1
  3. Assert cartPage.cartSummary is visible (CartSummaryComponent root).
    - expect: Cart summary region is visible on the page

#### 5.4. CART-04 — Adding the same product twice increases quantity or total (authenticated)

**File:** `tests/cart/cart-04-add-same-product-twice.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home via homePage fixture.
  2. Call homePage.addFirstProductToCart() twice.
    - expect: Each call resolves waitForLoadState('networkidle') without error
  3. Read homePage.header.getCartTotal().
    - expect: Total is at least 2× the sale price of the first product (APEX may accumulate quantity or create duplicate lines)

#### 5.5. CART-05 — Remove item from cart reduces cart row count (authenticated)

**File:** `tests/cart/cart-05-remove-item.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home, addFirstProductToCart(), then goToCart() to reach cartPage.
    - expect: At least one item in cart
  2. Record rowCount = await cartPage.getCartRowCount().
    - expect: rowCount >= 1
  3. Call cartPage.removeItemByIndex(0) — locates a Remove/Delete button in the first row and clicks it. APEX note: removal may trigger an AJAX refresh; await waitForLoadState('networkidle') is called inside the method.
    - expect: Row count decreases by 1 OR cart shows 'empty' state if rowCount was 1
  4. If rowCount was 1, assert cartPage.emptyCartMessage is visible.
    - expect: Empty cart state message is shown when all items removed

#### 5.6. CART-06 — Update quantity in cart updates the line total (authenticated)

**File:** `tests/cart/cart-06-update-quantity.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home, addFirstProductToCart(), then goToCart().
    - expect: One item in cart with quantity 1
  2. Call cartPage.updateQuantity(0, 3) — fills qty input in the first row with '3' and presses Tab.
    - expect: APEX AJAX resolves (waitForLoadState('networkidle'))
  3. Assert the line total in the first row reflects quantity 3.
    - expect: Line total equals 3 × product sale price
    - expect: Cart summary total also updates accordingly

#### 5.7. CART-07 — Cart detail page is protected — guest is redirected to login

**File:** `tests/cart/cart-07-cart-guest-redirect.spec.ts`

**Steps:**
  1. Preconditions: guest (no storageState). Navigate directly to /org-wise-cart-detail1?p42_pid_org=1.
  2. Assert the page redirects to /login_desktop.
    - expect: URL changes to /login_desktop
    - expect: Page title is 'LOGIN'
    - expect: Cart detail content is NOT shown to unauthenticated users

#### 5.8. CART-08 — Empty cart state shows informational message (authenticated)

**File:** `tests/cart/cart-08-empty-cart-state.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json) with a fresh/empty cart. Navigate directly to /org-wise-cart-detail1?p42_pid_org=1.
    - expect: Page loads without redirect
  2. Assert cartPage.emptyCartMessage is visible, OR assert cartPage.getCartRowCount() returns 0.
    - expect: Empty cart state is shown with an appropriate message
    - expect: No checkout button is active (or checkout button leads to an empty-cart error if clicked)

### 6. 6 — Checkout

**Seed:** `fixtures/fixtures.ts`

#### 6.1. CHK-01 — Proceed to checkout from cart navigates to checkout page (authenticated)

**File:** `tests/checkout/chk-01-proceed-to-checkout.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home, call homePage.addFirstProductToCart(), then homePage.header.goToCart().
    - expect: Cart detail page is loaded with at least one item
  2. Call cartPage.proceedToCheckout() — clicks the checkout button in CartSummaryComponent and awaits URL matching /checkout.
    - expect: Browser navigates to a URL matching /checkout
    - expect: Checkout page loads successfully
  3. Assert basic checkout page structure is visible: at minimum a form with shipping or payment fields.
    - expect: At least one of checkoutPage.firstNameInput, checkoutPage.emailInput, or checkoutPage.addressInput is visible

#### 6.2. CHK-02 — Checkout happy path: fill all fields and submit (authenticated)

**File:** `tests/checkout/chk-02-happy-path.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home, addFirstProductToCart(), goToCart(), proceedToCheckout().
    - expect: Checkout page is loaded
  2. Call checkoutPage.fillShippingDetails({ firstName: 'Test', lastName: 'User', email: 'test.user@example.com', address: '123 Test Street', city: 'Mumbai', zip: '400001' }).
    - expect: All shipping fields are populated with the provided values
  3. Call checkoutPage.fillPaymentDetails({ number: '4111111111111111', expiry: '12/26', cvv: '123' }).
    - expect: Payment fields are populated
  4. Call checkoutPage.placeOrder() — clicks the Place Order button and awaits waitForLoadState('networkidle').
    - expect: No APEX validation error appears
  5. Assert checkoutPage.confirmationMessage is visible within 20 seconds.
    - expect: Confirmation message matching /order.*(placed|confirmed|success)/i is displayed
    - expect: Order appears to have been submitted successfully

#### 6.3. CHK-03 — Checkout with empty form shows validation errors (authenticated)

**File:** `tests/checkout/chk-03-empty-form-validation.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to /home, addFirstProductToCart(), goToCart(), proceedToCheckout().
    - expect: Checkout page is loaded
  2. Call checkoutPage.placeOrder() immediately without filling any fields.
  3. Assert that an APEX validation error alert or inline field error appears.
    - expect: An element matching .t-Alert--danger, .apex-page-error, or [class*='error'] is visible
    - expect: The page stays on the checkout URL (no redirect to confirmation)
    - expect: Error text references one or more required fields

#### 6.4. CHK-04 — Checkout with missing required shipping field shows field-level error (authenticated)

**File:** `tests/checkout/chk-04-missing-field-validation.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Navigate to checkout after adding one product to cart.
  2. Call checkoutPage.fillShippingDetails() with email field left blank (pass empty string for email). Fill all other shipping fields and all payment fields.
  3. Call checkoutPage.placeOrder().
    - expect: APEX validation error is shown referencing the email field
    - expect: Order is NOT placed
    - expect: Confirmation message is NOT shown

#### 6.5. CHK-05 — Checkout page is protected — guest is redirected to login

**File:** `tests/checkout/chk-05-checkout-guest-redirect.spec.ts`

**Steps:**
  1. Preconditions: guest (no storageState). Navigate directly to the checkout URL (/checkout or /ords/r/sanjay_sikder/ecommerceportal/checkout).
  2. Assert the page redirects to /login_desktop.
    - expect: URL changes to /login_desktop
    - expect: Page title is 'LOGIN'
    - expect: Checkout form is NOT shown to unauthenticated users

#### 6.6. CHK-06 — Order number or reference is shown after successful checkout (authenticated)

**File:** `tests/checkout/chk-06-order-number.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json). Complete the full checkout happy path (same as CHK-02).
    - expect: Confirmation message is visible
  2. Call checkoutPage.getOrderNumber().
    - expect: getOrderNumber() returns a non-null, non-empty string if the APEX page renders an order reference
    - expect: OR the confirmation message contains an order number pattern (digits or alphanumeric reference)

#### 6.7. CHK-07 — Proceeding to checkout with empty cart shows error or redirects (authenticated)

**File:** `tests/checkout/chk-07-empty-cart-checkout.spec.ts`

**Steps:**
  1. Preconditions: authenticated user (storageState: .auth/user.json) with an empty cart. Navigate directly to /org-wise-cart-detail1?p42_pid_org=1.
    - expect: Cart page loads
  2. Attempt to click the checkout button (cartPage.cartSummary.checkoutBtn) if it is visible.
  3. Assert one of: (a) the checkout button is disabled or not rendered when the cart is empty; (b) clicking it shows an APEX error message; (c) the page remains on the cart page with an appropriate message.
    - expect: The user is not able to place an order with an empty cart
    - expect: Either the button is absent/disabled or an error message prevents progression
