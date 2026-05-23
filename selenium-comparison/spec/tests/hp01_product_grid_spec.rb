require_relative '../spec_helper'

# Mirrors: tests/home/hp-01-product-grid.spec.ts
# Guest session — no auth required.

KNOWN_CATALOGUE = [
  'Samsung', 'Honor X6b', 'Infinix Hot 40 Pro', 'infinix Hot 50 Pro',
  'Honor X8b', 'iPhone 16 Pro Max', 'Infinix Note 40s',
  'TWS Pro Bluetooth Earbuds', 'Awei AT7 Headphone',
  'HD Stereo Wired headphones', 'Redmi 15'
].freeze

RSpec.describe '1 — Home Page' do
  subject(:home) { HomePage.new(@driver) }

  before { home.navigate }

  it 'HP-01 — Product grid renders all catalogue items' do
    expect(@driver.title).to eq('Home')
    expect(@driver.current_url).to match(/\/home/)

    home.wait_for_products
    cards = home.product_card_elements

    expect(cards.length).to eq(11)

    cards.each do |card|
      title          = home.card_title(card)
      sale_price     = home.card_sale_price(card)
      original_price = home.card_original_price(card)

      expect(title.length).to be > 0
      expect(sale_price.length).to be > 0
      expect(sale_price).to match(/\d/)

      next if original_price.empty?

      orig = original_price.gsub(/[^\d.]/, '').to_f
      sale = sale_price.gsub(/[^\d.]/, '').to_f
      expect(orig).to be > sale if orig > 0 && sale > 0
    end

    KNOWN_CATALOGUE.each do |name|
      expect(home.text_visible_in_grid?(name)).to be(true),
        "Expected '#{name}' to be visible in product grid"
    end

    expect(home.discount_offer_strip_visible?).to be(true)
    expect(home.discount_offer_label_visible?).to be(true)
    expect(home.hot_label_visible?).to be(true)
  end
end
