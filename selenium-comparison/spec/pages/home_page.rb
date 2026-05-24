require_relative 'base_page'

class HomePage < BasePage
  def navigate
    goto('home')
    wait_for_apex_idle(timeout: 20)
  end

  # Waits for the product grid (ul containing Add to Cart buttons) to appear
  def wait_for_products(timeout: 20)
    wait_for(timeout: timeout) { product_grid }
  end

  # Returns the <ul> element containing product cards
  # Use contains(.) instead of normalize-space(text()) so inner spans are included
  def product_grid
    @driver.find_element(
      :xpath,
      "//ul[.//button[contains(.,'Add to Cart')]]"
    )
  rescue Selenium::WebDriver::Error::NoSuchElementError
    nil
  end

  # Returns all <li> elements within the product grid
  def product_card_elements
    grid = product_grid
    grid ? grid.find_elements(:tag_name, 'li') : []
  end

  def product_count
    product_card_elements.size
  end

  # Gets the title from a product card <li> element
  def card_title(card_el)
    @driver.execute_script(<<~JS, card_el)
      const li = arguments[0];
      const link = Array.from(li.querySelectorAll('a')).find(a => a.textContent.trim().length > 2);
      if (link) return link.textContent.trim();
      const p = li.querySelector('p, h2, h3, h4, .product-name, [class*="name"]');
      if (p) return p.textContent.trim();
      return li.textContent.trim().split('\\n').find(t => t.trim().length > 2) || '';
    JS
  rescue StandardError
    ''
  end

  # Gets the sale price from a product card (price after discount).
  # Ports the Playwright getSalePrice() logic: fast-path class match, then
  # del-sibling walk (discounted), then h3 text-node walk (non-discounted).
  def card_sale_price(card_el)
    @driver.execute_script(<<~JS, card_el)
      const li = arguments[0];

      // Fast path: element with a price class that is not struck-through
      const priceEl = li.querySelector('[class*="price"]:not(del):not(s)');
      if (priceEl && priceEl.textContent.trim()) return priceEl.textContent.trim();

      // Discounted products: sale price is the element or text node after <del>/<s>
      const del = li.querySelector('del, s');
      if (del) {
        const nextEl = del.nextElementSibling;
        if (nextEl && !/^(DEL|S)$/.test(nextEl.tagName)) {
          const t = (nextEl.textContent || '').trim();
          if (t && /\\d/.test(t)) return t;
        }
        let node = del.nextSibling;
        while (node) {
          const t = (node.textContent || '').trim();
          if (t && /\\d/.test(t)) return t;
          node = node.nextSibling;
        }
      }

      // Non-discounted products: bare text node inside h3 matching a price pattern
      const h3 = li.querySelector('h3');
      if (h3) {
        const walker = document.createTreeWalker(h3, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          const t = (n.textContent || '').trim();
          if (t && /[\\d,]+\\.\\d{2}/.test(t)) return t;
        }
      }

      return '';
    JS
  rescue StandardError
    ''
  end

  # Gets the original (struck-through) price from a card
  def card_original_price(card_el)
    el = card_el.find_elements(:css, 'del, s').first
    el&.text&.strip || ''
  rescue StandardError
    ''
  end

  # Scrolls first Add to Cart button into view, clicks it, and waits for the
  # cart sidebar total to change — mirrors Playwright's waitForLoadState('networkidle')
  # without requiring a sleep, and handles AJAX calls not tracked by apex.server.busy.
  def add_first_product_to_cart
    btn = wait_for(timeout: 15) do
      @driver.find_element(:xpath, "//button[contains(.,'Add to Cart')]")
    end
    @driver.execute_script('arguments[0].scrollIntoView({block:"center"})', btn)

    before = cart_total
    btn.click

    wait_for(timeout: 15) { cart_total != before }
  rescue Selenium::WebDriver::Error::TimeoutError
    wait_for_apex_idle
  end

  # Returns cart sidebar total text (e.g. "400.00")
  def cart_total
    total = @driver.execute_script(<<~JS)
      const tables = Array.from(document.querySelectorAll('table'));
      const cart = tables.find(t => (t.getAttribute('aria-label') || '').toLowerCase().includes('cart'));
      if (cart) {
        const link = cart.querySelector('a');
        return link ? link.textContent.trim() : '0.00';
      }
      return '0.00';
    JS
    total.to_s.strip
  rescue StandardError
    '0.00'
  end

  def discount_offer_strip_visible?
    el = @driver.find_elements(
      :css, '#stiker-container, .ticker_holder, [id*="ticker"]'
    ).first
    el&.displayed? || false
  end

  def discount_offer_label_visible?
    @driver.find_elements(:xpath, "//*[normalize-space(text())='Discount Offer']").any?(&:displayed?)
  end

  def hot_label_visible?
    @driver.find_elements(:xpath, "//*[normalize-space(text())='HOT']").any?(&:displayed?)
  end

  def text_visible_in_grid?(text)
    grid = product_grid
    return false unless grid
    grid.find_elements(:xpath, ".//*[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'#{text.downcase}')]").any?(&:displayed?)
  rescue StandardError
    false
  end

  # Primary: role="region" with aria-label containing "smart filter"
  # Fallback: any .t-Region that contains a button whose text includes "Smart Filter"
  SMART_FILTER_XPATH =
    "(//*[@role='region' and " \
    "contains(translate(@aria-label,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'smart filter')] | " \
    "//*[contains(@class,'t-Region') and .//button[contains(.,'Smart Filter')]])[1]"

  # Smart Filter helpers (for sf04 spec)
  def smart_filter_region
    wait_for(timeout: 15) do
      @driver.find_elements(:xpath, SMART_FILTER_XPATH).first
    end
  rescue Selenium::WebDriver::Error::TimeoutError
    nil
  end

  # APEX applies is-collapsed asynchronously during theme init — wait up to 15 s.
  # If the class never appears, fall back to checking that the body is not displayed
  # (the functional equivalent of collapsed).
  def smart_filter_has_collapsed_class?
    wait_for(timeout: 15) do
      region = @driver.find_elements(:xpath, SMART_FILTER_XPATH).first
      next false unless region
      classes = region.attribute('class').to_s
      if classes.include?('is-collapsed')
        true
      else
        body = region.find_elements(:css, '.t-Region-body.a-Collapsible-content').first
        body && !body.displayed?
      end
    end
  rescue Selenium::WebDriver::Error::TimeoutError
    false
  end

  def smart_filter_body_visible?
    region = smart_filter_region
    return false unless region
    body = region.find_elements(:css, '.t-Region-body.a-Collapsible-content').first
    body&.displayed? || false
  rescue StandardError
    false
  end

  def smart_filter_toggle_btn
    region = smart_filter_region
    # Use contains(.) to match button text in child spans
    region&.find_element(:xpath, ".//button[contains(.,'Smart Filter')]")
  end

  def click_smart_filter_toggle
    btn = smart_filter_toggle_btn
    btn&.click
    wait_for_apex_idle(timeout: 5)
  end

  # Cart link navigation (HeaderComponent.goToCart equivalent)
  def go_to_cart
    cart_link = @driver.execute_script(<<~JS)
      const tables = Array.from(document.querySelectorAll('table'));
      const cart = tables.find(t => (t.getAttribute('aria-label') || '').toLowerCase().includes('cart'));
      return cart ? cart.querySelector('a') : null;
    JS
    raise 'Cart link not found in sidebar' unless cart_link
    cart_link.click
    wait_for_url(/cart.detail|org-wise-cart/i)
  end
end
