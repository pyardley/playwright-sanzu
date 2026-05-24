require_relative '../spec_helper'

# Mirrors: tests/search/sf-04-smart-filter-toggle.spec.ts
# Guest session — no auth required.

RSpec.describe '2 — Search and Filtering' do
  subject(:home) { HomePage.new(@driver) }

  before { home.navigate }

  it 'SF-04 — Smart Filter expands and collapses on toggle' do
    expect(@driver.current_url).to match(/\/home/)

    # Initially collapsed
    expect(home.smart_filter_collapsed?).to be(true)
    expect(home.smart_filter_body_visible?).to be(false)

    # Expand — wait_until polls smart_filter_collapsed? until it flips
    home.click_smart_filter_toggle
    wait_until(timeout: 5) { !home.smart_filter_collapsed? }

    expect(home.smart_filter_collapsed?).to be(false)
    expect(home.smart_filter_body_visible?).to be(true)

    # Collapse again
    home.click_smart_filter_toggle
    wait_until(timeout: 5) { home.smart_filter_collapsed? }

    expect(home.smart_filter_collapsed?).to be(true)
    expect(home.smart_filter_body_visible?).to be(false)
  end
end
