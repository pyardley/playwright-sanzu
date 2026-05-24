require_relative 'base_page'

SUBMIT_BTN_XPATH = "//button[@type='submit' or contains(@class,'t-Button--hot')] | //input[@type='submit']"

class LoginPage < BasePage
  def login_as(email, password)
    goto('login_desktop')
    apex_set_credentials(email, password)

    submit_btn = find(:xpath, SUBMIT_BTN_XPATH)
    submit_btn.click

    wait_for_url(/home|dashboard/i, timeout: 30)
  end

  def navigate_to_login
    goto('login_desktop')
  end

  def fill_credentials(email, password)
    apex_set_credentials(email, password)
  end

  def submit
    find(:xpath, SUBMIT_BTN_XPATH).click
    wait_for_apex_idle
  end

  def error_message
    el = @driver.find_elements(:css, '#t_Alert_Notification, .t-Alert--danger, .t-Alert--warning, .t-Alert--error, #APEX_ERROR_MESSAGE').first
    el&.text&.strip
  end

  def error_visible?(timeout: 8)
    Selenium::WebDriver::Wait.new(timeout: timeout).until do
      els = @driver.find_elements(:css, '#t_Alert_Notification, .t-Alert--danger, .t-Alert--warning, .t-Alert--error, #APEX_ERROR_MESSAGE, [class*="error-msg"]')
      els.any?(&:displayed?)
    end
  rescue Selenium::WebDriver::Error::TimeoutError
    false
  end

  def email_input_visible?
    @driver.find_elements(:xpath, "//*[contains(@id,'USERNAME') or contains(@name,'USERNAME')]").any?(&:displayed?)
  end

  def password_input_visible?
    @driver.find_elements(:xpath, "//*[contains(@id,'PASSWORD') or contains(@name,'PASSWORD')]").any?(&:displayed?)
  end

  def submit_button_visible?
    @driver.find_elements(:xpath, SUBMIT_BTN_XPATH).any?(&:displayed?)
  end

  def login_link_visible?
    @driver.find_elements(:xpath, "//a[contains(@href,'login_desktop')]").any?(&:displayed?)
  end

  def logged_in_indicator_visible?
    indicators = @driver.find_elements(:xpath,
      "//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'my account')] | " \
      "//button[contains(@aria-label,'account') or contains(@aria-label,'user')]")
    return true if indicators.any?(&:displayed?)

    # Also check for username-shaped button (email in nav)
    @driver.find_elements(:css, '.t-NavigationBar-item--user, [class*="user-menu"]').any?(&:displayed?)
  end

  private

  # Sets login credentials via APEX's own item registry (apex.item().setValue()).
  # XPath-based element finding matches the container DIV (P101_USERNAME_CONTAINER)
  # rather than the actual input, so we bypass the DOM entirely and use APEX's API
  # with the fixed page-item names for page 101 (the login page).
  def apex_set_credentials(email, password)
    @driver.execute_script(<<~JS, email, password)
      apex.item('P101_USERNAME').setValue(arguments[0]);
      apex.item('P101_PASSWORD').setValue(arguments[1]);
    JS
  end
end
