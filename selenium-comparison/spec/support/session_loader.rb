require 'json'

module SessionLoader
  AUTH_FILE = File.expand_path('../../../../.auth/user.json', __FILE__)

  def self.available?
    File.exist?(AUTH_FILE)
  end

  # Loads Playwright storageState cookies into the given driver.
  # The driver must already be on the target domain before calling this.
  def self.load(driver)
    unless available?
      raise "Auth file not found at #{AUTH_FILE}.\n" \
            "Run the Playwright seed first: npx playwright test seed.spec.ts"
    end

    state = JSON.parse(File.read(AUTH_FILE))

    state.fetch('cookies', []).each do |c|
      cookie = { name: c['name'], value: c['value'], path: c['path'] || '/' }
      cookie[:secure]    = c['secure']   if c.key?('secure')
      cookie[:http_only] = c['httpOnly'] if c.key?('httpOnly')
      if c['expires'] && c['expires'].to_i > 0
        cookie[:expires] = Time.at(c['expires'].to_i)
      end
      driver.manage.add_cookie(cookie)
    rescue Selenium::WebDriver::Error::InvalidCookieDomainError
      # Cookie domain doesn't match current page — skip
    rescue StandardError
      # Malformed cookie — skip
    end
  end
end
