const { installedBrowsers } = require('@vue/cli-shared-utils')

module.exports = [
  {
    name: 'webdrivers',
    type: `checkbox`,
    message: `Pick browsers to run end-to-end test on`,
    choices: [
      {
        name: `Chrome`,
        value: 'chrome',
        checked: true
      },
      {
        name: 'Firefox',
        value: 'firefox',
        // check the "Firefox" option if user has installed it
        checked: !!installedBrowsers.firefox
      }
    ]
  }
]
