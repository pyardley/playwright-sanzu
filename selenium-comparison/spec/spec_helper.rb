require 'csv'
require 'fileutils'
require 'time'
require 'dotenv'
require 'selenium-webdriver'

Dotenv.load(File.expand_path('../../.env', __dir__))

require_relative 'support/driver_factory'
require_relative 'support/wait_helpers'
require_relative 'support/session_loader'
require_relative 'pages/base_page'
require_relative 'pages/home_page'
require_relative 'pages/login_page'
require_relative 'pages/cart_page'

RESULTS_FILE = File.expand_path('../results/timing_comparison.csv', __dir__)

RSpec.configure do |config|
  config.include WaitHelpers

  config.before(:suite) do
    FileUtils.mkdir_p(File.dirname(RESULTS_FILE))
    CSV.open(RESULTS_FILE, 'w') do |csv|
      csv << ['test', 'elapsed_seconds', 'framework', 'timestamp']
    end
    puts "\nResults will be written to: #{RESULTS_FILE}\n"
  end

  config.before(:each) do
    @driver = DriverFactory.create
    @driver.manage.timeouts.implicit_wait = 0  # use explicit waits only
  end

  config.after(:each) do
    @driver&.quit
  rescue StandardError
    nil
  end

  config.around(:each) do |example|
    start = Time.now
    example.run
    elapsed = (Time.now - start).round(2)
    CSV.open(RESULTS_FILE, 'a') do |csv|
      csv << [example.full_description, elapsed, 'selenium-ruby', Time.now.iso8601]
    end
  end
end
