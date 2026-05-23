require 'selenium-webdriver'

module DriverFactory
  def self.create
    options = Selenium::WebDriver::Chrome::Options.new
    options.add_argument('--headless=new') if ENV['HEADLESS'] != 'false'
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1280,900')
    options.add_argument('--lang=en-US')
    options.add_argument('--disable-search-engine-choice-screen')
    Selenium::WebDriver.for(:chrome, options: options)
  end
end
