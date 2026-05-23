# Selenium WebDriver vs Playwright — Execution Time Comparison

Compares the wall-clock time to run an identical set of 7 tests against the same Oracle APEX application using two frameworks: Ruby + selenium-webdriver and TypeScript + Playwright.

---

## Prerequisites

Both suites read credentials from the `.env` file in the project root:

```
BASE_URL=https://<your-apex-host>
TEST_USER_EMAIL=<email>
TEST_USER_PASSWORD=<password>
```

**Selenium (Ruby)**

- Ruby ≥ 3.1
- Bundler (`gem install bundler`)
- Chrome installed (Selenium Manager downloads ChromeDriver automatically)

**Playwright (TypeScript)**

- Node.js ≥ 18
- `npm install` already run in the project root
- Playwright browsers installed (`npx playwright install chromium`)

---

## Running the Selenium suite

Run from the project root:

```powershell
cd selenium-comparison
bundle install          # first time only
bundle exec rspec spec/tests/ --format documentation
```

Or to run a single spec:

```powershell
bundle exec rspec spec/tests/hp01_product_grid_spec.rb
```

Each test opens a fresh Chrome window, runs, then closes it. Tests run serially (one at a time) in the order RSpec discovers the files.

---

## Running the Playwright suite

Run from the project root (do **not** `cd` into a sub-directory):

```powershell
npx playwright test --config=playwright.comparison.config.ts
```

The comparison config matches the Selenium settings as closely as possible:

| Setting | Value |
|---|---|
| Browser | Chromium (Chrome) |
| Viewport | 1280 × 900 |
| Headless | true (set `HEADLESS=false` to watch) |
| Workers | 1 (serial) |
| Retries | 0 |

The config runs a seed step first (`seed.spec.ts`) to write `.auth/user.json`, then runs the 7 comparison tests using that saved session for authenticated tests.

To run headed so you can watch:

```powershell
$env:HEADLESS='false'; npx playwright test --config=playwright.comparison.config.ts
```

---

## The 7 tests

| ID | Selenium spec file | Playwright spec file | Auth |
|---|---|---|---|
| HP-01 | `spec/tests/hp01_product_grid_spec.rb` | `tests/home/hp-01-product-grid.spec.ts` | Guest |
| AUTH-01 | `spec/tests/auth01_happy_path_spec.rb` | `tests/auth/auth-01-happy-path.spec.ts` | Guest |
| AUTH-02 | `spec/tests/auth02_invalid_password_spec.rb` | `tests/auth/auth-02-invalid-password.spec.ts` | Guest |
| CART-01 | `spec/tests/cart01_add_item_spec.rb` | `tests/cart/cart-01-add-item-home.spec.ts` | Auth |
| CHK-01 | `spec/tests/chk01_proceed_to_checkout_spec.rb` | `tests/checkout/chk-01-proceed-to-checkout.spec.ts` | Auth |
| SF-04 | `spec/tests/sf04_smart_filter_toggle_spec.rb` | `tests/search/sf-04-smart-filter-toggle.spec.ts` | Guest |
| PD-01 | `spec/tests/pd01_product_info_display_spec.rb` | `tests/product/pd-01-product-info-display.spec.ts` | Guest |

---

## Where to find results

### Selenium — CSV

```
selenium-comparison/results/timing_comparison.csv
```

Written by the RSpec `around` hook in `spec/spec_helper.rb`. Columns:

| Column | Description |
|---|---|
| `test` | Full RSpec description (group + example name) |
| `elapsed_seconds` | Wall-clock time for that one example, in seconds |
| `framework` | Always `selenium-ruby` |
| `timestamp` | ISO-8601 timestamp at the end of the example |

Example rows:

```
test,elapsed_seconds,framework,timestamp
1 — Home Page HP-01 — Product grid renders all catalogue items,18.42,selenium-ruby,2025-05-23T21:10:04+00:00
3 — Authentication AUTH-01 — Successful login with valid credentials redirects to home,12.87,selenium-ruby,2025-05-23T21:10:17+00:00
```

The file is **overwritten** at the start of each run, so it always contains exactly the most recent run.

### Playwright — JSON

```
playwright-report/comparison-results.json
```

Written by the JSON reporter in `playwright.comparison.config.ts`. Each test result is nested inside `suites[].suites[].specs[].tests[].results[]`. The key field is:

| Field | Description |
|---|---|
| `duration` | Wall-clock time in **milliseconds** |
| `status` | `passed`, `failed`, or `skipped` |
| `title` | Test title (the `test(...)` description string) |

To pull just the durations from the command line:

```powershell
# PowerShell
$json = Get-Content playwright-report\comparison-results.json | ConvertFrom-Json
$json.suites | ForEach-Object { $_.suites } | ForEach-Object { $_.specs } |
  ForEach-Object { [pscustomobject]@{ title = $_.title; duration_s = [math]::Round($_.tests[0].results[0].duration / 1000, 2) } }
```

The seed test (`comparison-setup`) appears first in the JSON but is excluded from the 7 comparison timings — only include rows from the `comparison` project.

Playwright also generates an HTML report (open in a browser for a visual breakdown):

```powershell
npx playwright show-report
```

---

## Comparing results

Convert Playwright milliseconds to seconds before comparing. The tables below show the columns you are working with:

| Metric | Selenium CSV | Playwright JSON |
|---|---|---|
| Time unit | Seconds (`elapsed_seconds`) | Milliseconds (`duration`) |
| Granularity | Per example | Per test result |
| Wall-clock includes | Browser open + test + browser close | Page navigation + test (browser stays open across tests within a worker) |

**Important caveats**

- **Browser startup cost**: Selenium opens and closes a fresh Chrome process for every test. Playwright opens one browser at the start of the worker and reuses it for all 7 tests, closing once at the end. This systematically inflates Selenium times by ~1–2 s per test.
- **Network idle strategy**: Playwright uses `waitForLoadState('networkidle')` (waits for XHR to settle for 500 ms). Selenium uses `window.apex.server.busy` polling. These are equivalent in intent but not identical — small timing differences will occur.
- **Session handling**: Playwright authenticated tests reuse a saved `.auth/user.json` cookie jar (no login step). Selenium authenticated tests log in via the UI during the test. This inflates Selenium time for CART-01 and CHK-01 by the cost of the login flow (~5–10 s).

**A fair comparison** accounts for browser startup and login overhead. For the guest tests (HP-01, AUTH-01, AUTH-02, SF-04, PD-01) the times are directly comparable once the ~1–2 s startup penalty is subtracted from each Selenium time.

### Quick side-by-side

After running both suites, open the CSV and run the PowerShell snippet above, then build a table like this:

| Test | Playwright (s) | Selenium (s) | Difference |
|---|---|---|---|
| HP-01 | — | — | — |
| AUTH-01 | — | — | — |
| AUTH-02 | — | — | — |
| CART-01 | — | — | — |
| CHK-01 | — | — | — |
| SF-04 | — | — | — |
| PD-01 | — | — | — |
| **Total** | — | — | — |

Fill in from the two result files after each run.
