require_relative 'base_page'

SUBMIT_BTN_XPATH = "//button[@type='submit' or contains(@class,'t-Button--hot')] | //input[@type='submit']"

class LoginPage < BasePage
  def login_as(email, password)
    goto('login_desktop')

    # Fill via JS — APEX inputs exist in the DOM before they are interactable,
    # so send_keys raises ElementNotInteractableError. JS fill bypasses this.
    email_field = find(:xpath, "//*[contains(@id,'USERNAME') or contains(@name,'USERNAME')]")
    js_fill(email_field, email)

    pwd_field = find(:xpath, "//*[contains(@id,'PASSWORD') or contains(@name,'PASSWORD')]")
    js_fill(pwd_field, password)

    # Submit — APEX login button uses .t-Button--hot (may not have type="submit")
    submit_btn = find(:xpath, SUBMIT_BTN_XPATH)
    submit_btn.click

    wait_for_url(/home|dashboard/i, timeout: 20)
  end

  def navigate_to_login
    goto('login_desktop')
  end

  def fill_credentials(email, password)
    email_field = find(:xpath, "//*[contains(@id,'USERNAME') or contains(@name,'USERNAME')]")
    js_fill(email_field, email)

    pwd_field = find(:xpath, "//*[contains(@id,'PASSWORD') or contains(@name,'PASSWORD')]")
    js_fill(pwd_field, password)
  end

  def submit
    find(:xpath, SUBMIT_BTN_XPATH).click
    wait_for_apex_idle
  end

  def error_message
    el = @driver.find_elements(:css, '.t-Alert--danger, .t-Alert--error, #APEX_ERROR_MESSAGE').first
    el&.text&.strip
  end

  def error_visible?
    els = @driver.find_elements(:css, '.t-Alert--danger, .t-Alert--error, #APEX_ERROR_MESSAGE, [class*="error-msg"]')
    els.any?(&:displayed?)
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
end
