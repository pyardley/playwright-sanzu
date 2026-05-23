require_relative '../spec_helper'

# Mirrors: tests/product/pd-01-product-info-display.spec.ts
# Guest session — product detail page is publicly accessible.

APEX_ROOT = '/ords/r/sanjay_sikder/ecommerceportal'

RSpec.describe '4 — Product Detail Page' do
  before do
    @driver.navigate.to("#{ENV.fetch('BASE_URL')}#{APEX_ROOT}/product-detail-info?pid_product=1")
    Selenium::WebDriver::Wait.new(timeout: 15).until do
      @driver.execute_script('return document.readyState') == 'complete'
    end
    wait_for_apex_idle(@driver, timeout: 20)
    # Wait for the product content to render — APEX loads it via AJAX after page ready
    Selenium::WebDriver::Wait.new(timeout: 20).until do
      @driver.find_elements(:xpath, "//a[contains(.,'Samsung')]").any?(&:displayed?)
    end
  rescue Selenium::WebDriver::Error::TimeoutError
    nil # proceed — the assertion will produce the meaningful failure
  end

  it 'PD-01 — Product detail page displays full product information' do
    expect(@driver.title).to eq('Product Detail Info')

    # Samsung product name visible as a link (use . to match text in child spans too)
    samsung_links = @driver.find_elements(:xpath, "//a[contains(.,'Samsung')]")
    expect(samsung_links.any?(&:displayed?)).to be(true)

    # Full price 40,000.00 visible somewhere on the page
    price_els = @driver.find_elements(:xpath, "//*[contains(text(),'40,000.00')]")
    expect(price_els.any?(&:displayed?)).to be(true)

    # Product image with alt "Default Logo"
    img = @driver.find_elements(:xpath, "//img[@alt='Default Logo']")
    expect(img.any?(&:displayed?)).to be(true)

    # Review List table with expected column headers
    review_table = @driver.find_elements(:xpath,
      "//table[@aria-label='Review List'] | //table[@summary='Review List']"
    ).first
    expect(review_table).not_to be_nil
    expect(review_table.displayed?).to be(true)

    %w[Client\ User Review\ Message Review\ Date User\ Rating].each do |col|
      # Use . (full descendant text) not text() (direct text nodes only) — APEX wraps th content in spans
      headers = @driver.find_elements(:xpath, "//th[contains(.,'#{col}')]")
      expect(headers.any?(&:displayed?)).to be(true), "Column '#{col}' not visible"
    end

    # >= 3 rows (1 header + >= 2 data rows)
    rows = review_table.find_elements(:tag_name, 'tr')
    expect(rows.length).to be >= 3

    # Statistics region visible with expected cells
    stats_region = @driver.find_elements(:xpath,
      "//*[@role='region'][@aria-label='Statistics'] | //*[@aria-label='Statistics']"
    ).first
    expect(stats_region&.displayed?).to be(true)

    ['Product Rate', 'Total Chatting or Query', 'Total Review'].each do |cell_text|
      cells = @driver.find_elements(:xpath, "//td[contains(.,'#{cell_text}')]")
      expect(cells.any?(&:displayed?)).to be(true), "Cell '#{cell_text}' not visible"
    end

    # Rating Chart region visible
    rating_chart = @driver.find_elements(:xpath,
      "//*[@role='region'][@aria-label='Rating Chart'] | //*[@aria-label='Rating Chart']"
    ).first
    expect(rating_chart&.displayed?).to be(true)
  end
end
