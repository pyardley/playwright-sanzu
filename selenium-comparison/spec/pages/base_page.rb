class BasePage
  APEX_ROOT = '/ords/r/sanjay_sikder/ecommerceportal'

  def initialize(driver)
    @driver = driver
    @wait   = Selenium::WebDriver::Wait.new(timeout: 15)
  end

  def goto(path)
    @driver.navigate.to("#{base_url}#{APEX_ROOT}/#{path}")
    wait_for_apex_ready
  end

  def current_url = @driver.current_url
  def title       = @driver.title

  protected

  def base_url
    ENV.fetch('BASE_URL', '')
  end

  def wait_for_apex_ready(timeout: 20)
    Selenium::WebDriver::Wait.new(timeout: timeout).until do
      @driver.execute_script(
        "return typeof window.apex !== 'undefined' && window.apex.event !== undefined"
      )
    end
  rescue Selenium::WebDriver::Error::TimeoutError
    # APEX may not be present on all pages (e.g. login page) — non-fatal
  end

  def wait_for_url(pattern, timeout: 30)
    Selenium::WebDriver::Wait.new(timeout: timeout).until do
      @driver.current_url.match?(pattern)
    end
  end

  def wait_for_title(pattern, timeout: 15)
    Selenium::WebDriver::Wait.new(timeout: timeout).until do
      @driver.title.match?(pattern)
    end
  end

  def wait_for(timeout: 15, &block)
    Selenium::WebDriver::Wait.new(timeout: timeout).until(&block)
  end

  def find(by, selector)
    @wait.until { @driver.find_element(by, selector) }
  end

  def js_clear(element)
    @driver.execute_script("arguments[0].value = ''", element)
  end

  # Sets an input value via JS, bypassing interactability requirements.
  # Tries apex.item(id).setValue() first so APEX's internal item state is updated
  # (required for apex.submit() to send the correct value to the server).
  # Falls back to raw DOM assignment + events for non-APEX pages.
  def js_fill(element, value)
    @driver.execute_script(<<~JS, element, value)
      const el  = arguments[0];
      const val = arguments[1];
      if (typeof apex !== 'undefined' && el.id) {
        try {
          apex.item(el.id).setValue(val);
          return;
        } catch(e) {}
      }
      el.value = val;
      el.dispatchEvent(new Event('input',  {bubbles: true}));
      el.dispatchEvent(new Event('change', {bubbles: true}));
    JS
  end

  def find_all(by, selector)
    @driver.find_elements(by, selector)
  end

  # Replaces waitForLoadState('networkidle') — polls APEX AJAX busy state
  def wait_for_apex_idle(timeout: 15)
    Selenium::WebDriver::Wait.new(timeout: timeout).until do
      @driver.execute_script(<<~JS)
        if (window.apex && window.apex.server) { return !window.apex.server.busy; }
        return document.readyState === 'complete';
      JS
    end
  rescue Selenium::WebDriver::Error::TimeoutError
    nil
  end
end
