module WaitHelpers
  DEFAULT_TIMEOUT = 15
  LONG_TIMEOUT    = 30

  def wait_until(timeout: DEFAULT_TIMEOUT, &block)
    Selenium::WebDriver::Wait.new(timeout: timeout).until(&block)
  end

  def wait_for_url(driver, pattern, timeout: LONG_TIMEOUT)
    wait_until(timeout: timeout) { driver.current_url.match?(pattern) }
  end

  def wait_for_title(driver, pattern, timeout: DEFAULT_TIMEOUT)
    wait_until(timeout: timeout) { driver.title.match?(pattern) }
  end

  def wait_for_element(driver, by, selector, timeout: DEFAULT_TIMEOUT)
    wait_until(timeout: timeout) { driver.find_element(by, selector) }
  rescue Selenium::WebDriver::Error::TimeoutError
    nil
  end

  def wait_for_visible(driver, by, selector, timeout: DEFAULT_TIMEOUT)
    wait_until(timeout: timeout) do
      el = driver.find_element(by, selector)
      el if el.displayed?
    end
  rescue Selenium::WebDriver::Error::TimeoutError
    nil
  end

  # Replaces Playwright's waitForLoadState('networkidle') for APEX AJAX calls.
  # Polls the APEX server busy state; falls back to a short fixed wait.
  def wait_for_apex_idle(driver, timeout: DEFAULT_TIMEOUT)
    wait_until(timeout: timeout) do
      driver.execute_script(<<~JS)
        if (window.apex && window.apex.server) {
          return !window.apex.server.busy;
        }
        return document.readyState === 'complete';
      JS
    end
  rescue Selenium::WebDriver::Error::TimeoutError
    # Non-fatal — continue
  end
end
