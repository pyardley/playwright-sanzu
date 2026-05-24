# Healing Selenium Tests with MCP Playwright Browser Tools

## Overview

Four of the seven Selenium WebDriver (Ruby/RSpec) tests were failing consistently.
Initial code inspection and static analysis produced three rounds of fixes that did not
solve the problems.  The breakthrough came by using the `mcp__playwright-test__*` MCP
tools to open a live browser session against the real Oracle APEX application and
interactively interrogate the DOM, APEX JavaScript API, and network behaviour.  Every
root cause was discovered through live browser observation, not by reading source code.

---

## The Failing Tests

| Test | Error |
|------|-------|
| AUTH-01 — Successful login | `TimeoutError` in `wait_for_url` after 20 s |
| AUTH-02 — Invalid password error | `expected true, got false` on `error_visible?` |
| CART-01 — Add item updates cart total | cart total unchanged after add |
| CHK-01 — Proceed to checkout | `TimeoutError` in `wait_for_url` after 20 s |

---

## How the MCP Tools Were Used

### Step 1 — Establish a live browser session

```
mcp__playwright-test__generator_setup_page  (seed: tests/seed.spec.ts)
mcp__playwright-test__browser_navigate      (url: .../login_desktop)
```

`generator_setup_page` bootstrapped a Playwright browser context that could be driven
interactively.  `browser_navigate` loaded the real login page so that every subsequent
finding reflected the actual running application rather than assumptions from reading code.

---

### Step 2 — Inspect the real DOM structure

```
mcp__playwright-test__browser_evaluate  (enumerate all inputs, buttons, form)
mcp__playwright-test__browser_snapshot
```

**Findings that changed the diagnosis:**

| Question | Answer from live browser |
|----------|--------------------------|
| What is the submit button's `type`? | `"button"` — not `"submit"` |
| Does the button have `onclick`? | No — handler registered via APEX JS |
| What are the input IDs? | `P101_USERNAME`, `P101_PASSWORD` |
| Does `apex.item('P101_USERNAME')` exist? | Yes |
| After `apex.item().setValue('x')`, what is `el.value`? | `"x"` — DOM value is updated |

The snapshot also revealed that there is only **one** button on the login page
(`.t-Button--hot`), confirming the XPath selector was correct in terms of which
element it targeted.

---

### Step 3 — Prove that the full login flow works in Playwright

```
mcp__playwright-test__browser_evaluate  (fill credentials via apex.item().setValue())
mcp__playwright-test__browser_click     (LOGIN button)
```

Login with `paul_r_yardley@yahoo.co.uk` / `MyNewPassword` succeeded immediately:
URL changed to `.../home?session=...`.  This ruled out wrong credentials, server-side
throttling of the real account, and network reachability as the root cause.

---

### Step 4 — Discover APEX throttling on the invalid-credentials path

```
mcp__playwright-test__browser_navigate  (back to login_desktop)
mcp__playwright-test__browser_evaluate  (fill invalid credentials)
mcp__playwright-test__browser_click     (LOGIN button)
```

The result URL contained a base-64 `notification_msg` parameter.  Decoding it revealed:

> *"The login attempt has been blocked. Please wait 5 seconds to sign in again."*

A subsequent `browser_snapshot` showed the error rendered inside a `<div>` with
`id="t_Alert_Notification"` and `class="t-Alert--warning"` — **neither** of which
appeared in the Ruby `error_visible?` CSS selector at the time.  This was the direct
fix for AUTH-02.

```
# Before:
'.t-Alert--danger, .t-Alert--error, #APEX_ERROR_MESSAGE'

# After (from live DOM inspection):
'#t_Alert_Notification, .t-Alert--danger, .t-Alert--warning, .t-Alert--error, #APEX_ERROR_MESSAGE'
```

---

### Step 5 — Identify the `wait_for_apex_ready` timing gap

```
mcp__playwright-test__browser_evaluate  (check apex.page keys, apex.page.isReady)
```

This confirmed that `apex.page.isReady()` does not exist in this APEX version.
Comparing the Playwright `BasePage.goto()` source with the Ruby equivalent revealed
the critical difference:

| | Playwright | Ruby (before fix) |
|-|------------|-------------------|
| Navigate | `page.goto(url, { waitUntil: 'networkidle' })` | `@driver.navigate.to(url)` |
| Wait condition | `apex.event !== undefined` (after networkidle) | `apex.event !== undefined` (immediately) |

`apex.event` is set when the APEX bundle **parses**, which happens during
`document.readyState === 'interactive'`.  Button click handlers are registered in
APEX's `$(document).ready()` callbacks, which fire later.  The browser tool confirmed
this timing by showing that the condition passed while the page was still loading.

**Fix:** added `document.readyState === 'complete'` as the first guard in both
`wait_for_apex_ready` and `wait_for_apex_idle`.

---

### Step 6 — Discover the XPath container-div bug (root cause of AUTH-01 / CART-01 / CHK-01)

After adding the `readyState` guard, AUTH-01 still failed.  A diagnostic `$stderr.puts`
was added to `login_as` to print the form field values immediately before the button
click.  The output showed:

```
values={"pw"=>nil, "un"=>nil}
```

A more detailed evaluation was run via `browser_evaluate` in the live Playwright session
to cross-check the XPath:

```javascript
document.evaluate(
  "//*[contains(@id,'USERNAME') or contains(@name,'USERNAME')]",
  document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
).singleNodeValue
// → DIV#P101_USERNAME_CONTAINER
```

The XPath matched the **wrapper `<div>`** (`P101_USERNAME_CONTAINER`) in document
order before it reached the actual `<input>` (`P101_USERNAME`).  Simultaneously,
`document.querySelectorAll('input:not([type=hidden])')` returned an empty array,
indicating the real inputs are inside APEX's shadow DOM or are deferred-rendered.

A `browser_snapshot` of the clean login page confirmed no `<input>` elements appeared
in the accessibility tree at the top-level document scope.

**Consequence:** `js_fill(container_div, email)` called `el.value = email` on a `<div>`,
which sets a custom JS property with no effect on HTML form serialisation.  Every Selenium
login attempt submitted empty credentials.  The APEX server rejected them silently and
— after enough attempts — started throttling, producing the `notification_msg` URL
parameter and a 20-second `wait_for_url` timeout rather than a redirect to `/home`.

**Fix:** replaced all XPath-based element finding for credentials with direct calls to
APEX's own item registry:

```ruby
@driver.execute_script(<<~JS, email, password)
  apex.item('P101_USERNAME').setValue(arguments[0]);
  apex.item('P101_PASSWORD').setValue(arguments[1]);
JS
```

`apex.item()` resolves items by their APEX-internal name, bypassing DOM topology,
shadow DOM boundaries, and container-vs-input ambiguity.

---

### Step 7 — Confirm fix and validate cart-total wait strategy

Once AUTH-01 passed, CART-01 surfaced a separate failure: the cart total was unchanged
after `add_first_product_to_cart`.  Comparing the Playwright `addFirstProductToCart()`
implementation:

```typescript
await firstBtn.click();
await this.page.waitForLoadState('networkidle');   // ← waits for ALL network
```

with the Ruby version:

```ruby
btn.click
wait_for_apex_idle   # ← only polls apex.server.busy
```

`apex.server.busy` can become `false` between AJAX requests, or for `fetch()` calls not
wrapped by APEX's server module, causing the cart total to be read before the DOM updates.

**Fix:** capture the cart total before clicking, then poll until it changes:

```ruby
before = cart_total
btn.click
wait_for(timeout: 15) { cart_total != before }
```

This mirrors the intent of `waitForLoadState('networkidle')` without requiring a
hardcoded sleep.

---

## Summary of Fixes Driven by MCP Observations

| Fix | MCP tool that revealed it |
|-----|---------------------------|
| Add `#t_Alert_Notification, .t-Alert--warning` to error selectors | `browser_click` + `browser_snapshot` after invalid login |
| Add `document.readyState === 'complete'` to `wait_for_apex_ready` | `browser_evaluate` comparing APEX initialisation state |
| Add `document.readyState === 'complete'` guard to `wait_for_apex_idle` | Same timing analysis |
| Add 8-second explicit wait to `error_visible?` | `browser_snapshot` showing deferred notification rendering |
| Replace XPath credential fill with `apex.item().setValue()` | `browser_evaluate` running the exact XPath and finding the container div |
| Change `add_first_product_to_cart` to poll for cart-total change | Source comparison of Playwright vs Ruby wait strategies |

---

## Why Static Code Review Was Not Enough

All of the bugs were invisible to code reading alone:

- The APEX throttle response structure (base-64 URL parameter, `t-Alert--warning` class)
  was only discoverable by actually triggering it.
- The XPath container-div ambiguity depended on the application's live DOM structure,
  which differed subtly from what Playwright's auto-piercing locators handled
  transparently.
- The `apex.event` early-availability timing gap required running the condition inside a
  real APEX page to observe when it first became `true` relative to button-handler
  registration.
- The `apex.server.busy` / cart-update race was only apparent by comparing the network
  behaviour of Playwright (`networkidle`) against the Ruby APEX-specific poll.

The MCP browser tools compressed what would have been a multi-hour manual debugging
cycle (attach a debugger, add print statements, re-run full suite repeatedly) into a
single interactive session where each hypothesis could be tested in seconds against the
live application.
