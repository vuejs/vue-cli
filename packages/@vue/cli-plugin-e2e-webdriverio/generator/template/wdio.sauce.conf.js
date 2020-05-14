const { config } = require('./wdio.shared.conf')

const BUILD_ID = Math.ceil(Date.now() / 1000)

exports.config = {
  /**
   * base config
   */
  ...config,
  /**
   * config for testing on Sauce Labs
   */
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  region: 'us',
  headless: process.argv.includes('--headless'),

  services: [
    ['sauce', {
      sauceConnect: true,
      tunnelIdentifier: 'Vue.js Integration tests'
    }]
  ],

  maxInstances: 10,
  capabilities: [{
    browserName: 'firefox',
    browserVersion: 'latest',
    platformName: 'Windows 10',
    'sauce:options': {
      build: `Build ${BUILD_ID}`
    }
  }, {
    browserName: 'chrome',
    browserVersion: 'latest',
    platformName: 'Windows 10',
    'sauce:options': {
      build: `Build ${BUILD_ID}`
    }
  }]
}
