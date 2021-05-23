const { installedBrowsers } = require('@vue/cli-shared-utils')

module.exports = cli => {
  cli.injectFeature({
    name: 'E2E Testing',
    value: 'e2e',
    short: 'E2E',
    description: 'Add an End-to-End testing solution to the app like Cypress or Nightwatch',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/docs#e2e-testing',
    plugins: ['e2e-cypress', 'e2e-nightwatch', 'e2e-webdriverio']
  })

  cli.injectPrompt({
    name: 'e2e',
    when: answers => answers.features.includes('e2e'),
    type: 'list',
    message: 'Pick an E2E testing solution:',
    choices: [
      {
        name: 'Cypress (Test in Chrome, Firefox, MS Edge, and Electron)',
        value: 'cypress',
        short: 'Cypress'
      },
      {
        name: 'Nightwatch (WebDriver-based)',
        value: 'nightwatch',
        short: 'Nightwatch'
      },
      {
        name: 'WebdriverIO (WebDriver/DevTools based)',
        value: 'webdriverio',
        short: 'WebdriverIO'
      }
    ]
  })

  cli.injectPrompt({
    name: 'webdrivers',
    when: answers => ['nightwatch', 'webdriverio'].includes(answers.e2e),
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
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.e2e === 'cypress') {
      options.plugins['@vue/cli-plugin-e2e-cypress'] = {}
    } else if (answers.e2e === 'nightwatch') {
      options.plugins['@vue/cli-plugin-e2e-nightwatch'] = {
        webdrivers: answers.webdrivers
      }
    } else if (answers.e2e === 'webdriverio') {
      options.plugins['@vue/cli-plugin-e2e-webdriverio'] = {
        webdrivers: answers.webdrivers
      }
    }
  })
}
