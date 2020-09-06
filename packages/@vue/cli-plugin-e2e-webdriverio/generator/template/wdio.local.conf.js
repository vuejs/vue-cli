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
  services: [<%- options.webdrivers.includes('chrome') ?(options.webdrivers.length > 1 ? `'chromedriver', ` : `'chromedriver'`) : '' %><%- options.webdrivers.includes('firefox') ? `'geckodriver'` : ''%>],
  capabilities: [
    <%_ if (options.webdrivers.includes('chrome')) { _%>
    {
      browserName: 'chrome',
      acceptInsecureCerts: true,
      'goog:chromeOptions': {
        args: process.argv.includes('--headless')
          ? ['--headless', '--disable-gpu']
          : []
      }
    },
    <%_ } _%>
    <%_ if (options.webdrivers.includes('firefox')) { _%>
    {
      browserName: 'firefox',
      acceptInsecureCerts: true
    }
    <%_ } _%>
  ]
}
