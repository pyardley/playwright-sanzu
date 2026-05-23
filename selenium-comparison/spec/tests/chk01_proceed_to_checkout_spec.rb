require_relative '../spec_helper'

# Mirrors: tests/checkout/chk-01-proceed-to-checkout.spec.ts
# Authenticated — calls login_as explicitly.

RSpec.describe '6 — Checkout' do
  let(:login) { LoginPage.new(@driver) }
  let(:home)  { HomePage.new(@driver) }
  let(:cart)  { CartPage.new(@driver) }

  it 'CHK-01 — Proceed to checkout from cart navigates to checkout page (authenticated)' do
    login.login_as(
      ENV.fetch('TEST_USER_EMAIL'),
      ENV.fetch('TEST_USER_PASSWORD')
    )

    home.add_first_product_to_cart
    home.go_to_cart

    row_count = cart.cart_row_count
    expect(row_count).to be >= 1

    cart.proceed_to_checkout

    expect(@driver.title).to eq('Order Details')
    expect(cart.shipping_address_visible? || cart.place_order_button_visible?).to be(true)
  end
end
