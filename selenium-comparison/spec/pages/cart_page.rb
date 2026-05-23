require_relative 'base_page'

class CartPage < BasePage
  CART_PATH = 'org-wise-cart-detail1?p42_pid_org=1'

  def navigate
    goto(CART_PATH)
  end

  # Counts data rows in the cart table (excludes header and total rows)
  def cart_row_count
    rows = @driver.execute_script(<<~JS)
      const tables = Array.from(document.querySelectorAll('table'));
      const cart = tables.find(t => {
        const headers = Array.from(t.querySelectorAll('th'));
        return headers.some(h => h.textContent.includes('Product Name'));
      });
      if (!cart) return 0;
      const rows = Array.from(cart.querySelectorAll('tr'));
      return rows.filter(r => {
        const hasTh = r.querySelector('th');
        const text = r.textContent.trim().toLowerCase();
        return !hasTh && !text.startsWith('total');
      }).length;
    JS
    rows.to_i
  end

  def proceed_to_checkout
    btn = wait_for(timeout: 15) do
      @driver.find_elements(:xpath,
        "//a[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'place order')] | " \
        "//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'checkout')]"
      ).first
    end
    btn.click
    # Wait for Order Details page
    wait_for_title(/order.details|checkout/i, timeout: 20)
  end

  def order_details_page?
    @driver.title.match?(/order.details/i)
  end

  def shipping_address_visible?
    @driver.find_elements(:xpath,
      "//textarea[@aria-label='Shipping Address' or @id[contains(.,'SHIPPING')]] | " \
      "//input[@aria-label='Shipping Address' or @id[contains(.,'SHIPPING')]]"
    ).any?(&:displayed?)
  rescue StandardError
    false
  end

  def place_order_button_visible?
    @driver.find_elements(:xpath,
      "//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'place order')]"
    ).any?(&:displayed?)
  rescue StandardError
    false
  end
end
