require_relative '../spec_helper'

# Mirrors: tests/auth/auth-01-happy-path.spec.ts

RSpec.describe '3 — Authentication' do
  subject(:login) { LoginPage.new(@driver) }

  it 'AUTH-01 — Successful login with valid credentials redirects to home' do
    login.navigate_to_login

    expect(@driver.title).to eq('LOGIN')
    expect(login.email_input_visible?).to    be(true)
    expect(login.password_input_visible?).to be(true)
    expect(login.submit_button_visible?).to  be(true)

    login.login_as(
      ENV.fetch('TEST_USER_EMAIL'),
      ENV.fetch('TEST_USER_PASSWORD')
    )

    expect(@driver.current_url).to match(/\/home/)
    expect(@driver.title).to eq('Home')
    expect(login.logged_in_indicator_visible?).to be(true)
    expect(login.login_link_visible?).to be(false)
  end
end
