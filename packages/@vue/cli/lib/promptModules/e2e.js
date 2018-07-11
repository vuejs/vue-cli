module.exports = cli => {
  cli.injectFeature({
    name: 'E2E Testing',
    value: 'e2e',
    short: 'E2E',
    description: 'Add an End-to-End testing solution to the app like Cypress or Nightwatch',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/docs#e2e-testing',
    plugins: ['e2e-cypress', 'e2e-nightwatch']
  })

  cli.injectPrompt({
    name: 'e2e',
    when: answers => answers.features.includes('e2e'),
    type: 'list',
    message: 'Pick a E2E testing solution:',
    choices: [
      {
        name: 'Cypress (Chrome only)',
        value: 'cypress',
        short: 'Cypress'
      },
      {
        name: 'Nightwatch (Selenium-based)',
        value: 'nightwatch',
        short: 'Nightwatch'
      }
    ]
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.e2e === 'cypress') {
      options.plugins['@vue/cli-plugin-e2e-cypress'] = {}
    } else if (answers.e2e === 'nightwatch') {
      options.plugins['@vue/cli-plugin-e2e-nightwatch'] = {}
    }
  })
}
