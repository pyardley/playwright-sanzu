require_relative '../spec_helper'

# Mirrors: tests/auth/auth-02-invalid-password.spec.ts
# No retries — invalid login may trigger APEX throttling on repeated runs.

RSpec.describe '3 — Authentication' do
  subject(:login) { LoginPage.new(@driver) }

  it 'AUTH-02 — Login with invalid password shows error message' do
    login.navigate_to_login

    login.fill_credentials('invalid@example.com', 'WrongPassword123!')
    login.submit

    expect(@driver.current_url).to match(/login_desktop/)
    expect(login.error_visible?).to be(true)

    msg = login.error_message
    expect(msg).to be_truthy
    expect(msg.length).to be > 0
  end
end
