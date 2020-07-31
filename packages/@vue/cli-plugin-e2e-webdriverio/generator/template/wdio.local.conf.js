<%- hasTS ? 'const { config } = require(\'./wdio.shared.conf.ts\')' : 'const { config } = require(\'./wdio.shared.conf\')' %>

exports.config = {
  /**
   * base config
   */
  ...config,
  /**
   * config for local testing
   */
  maxInstances: 1,
  services: ['chromedriver', 'geckodriver'],
  capabilities: [{
    browserName: 'chrome',
    acceptInsecureCerts: true,
    'goog:chromeOptions': {
      args: process.argv.includes('--headless')
        ? ['--headless', '--disable-gpu']
        : []
    }
  }, {
    browserName: 'firefox',
    acceptInsecureCerts: true
  }]
}
