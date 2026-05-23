require_relative '../spec_helper'

# Mirrors: tests/cart/cart-01-add-item-home.spec.ts
# Authenticated — calls login_as explicitly (same pattern as the Playwright test).

RSpec.describe '5 — Cart Management' do
  let(:login) { LoginPage.new(@driver) }
  let(:home)  { HomePage.new(@driver) }

  it 'CART-01 — Adding a product from home page updates cart sidebar total (authenticated)' do
    # Log in and land on /home
    login.login_as(
      ENV.fetch('TEST_USER_EMAIL'),
      ENV.fetch('TEST_USER_PASSWORD')
    )

    initial_total = home.cart_total
    initial_value = initial_total.gsub(/[,\s]/, '').to_f

    home.add_first_product_to_cart

    # Verify we did NOT get redirected to login
    expect(@driver.current_url).not_to match(/login_desktop/)

    # Cart total must have increased
    updated_total = home.cart_total
    updated_value = updated_total.gsub(/[,\s]/, '').to_f
    expect(updated_value).to be > initial_value
  end
end
