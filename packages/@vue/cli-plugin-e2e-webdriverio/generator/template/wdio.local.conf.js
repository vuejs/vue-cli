const { config } = require('./wdio.shared.conf')

exports.config = {
  /**
   * base config
   */
  ...config,
  /**
   * config for local testing
   */
  maxInstances: 1,
  services: ['chromedriver'],
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: process.argv.includes('--headless')
        ? ['--headless', '--disable-gpu']
        : []
    }
  }]
}


console.log(process.argv);
