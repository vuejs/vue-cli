const inquirer = require('inquirer')

const isMode = _mode => ({ mode }) => _mode === mode
const hasFeature = feature => ({ features }) => features && features.includes(feature)

inquirer.prompt([
  {
    name: 'mode',
    type: 'list',
    message: `Pick a project creation mode:`,
    choices: [
      {
        name: 'Using saved preferences',
        value: 'saved'
      },
      {
        name: 'Zero-configuration with default features',
        value: 'default'
      },
      {
        name: 'Manually select features (advanced)',
        value: 'manual'
      }
    ]
  },
  {
    name: 'features',
    when: isMode('manual'),
    type: 'checkbox',
    message: 'Please check all features needed for your project.',
    choices: [
      {
        name: 'Vue-router + Vuex',
        value: 'router+vuex',
        short: 'Router, Vuex'
      },
      {
        name: 'TypeScript',
        value: 'ts'
      },
      {
        name: 'Progressive Web App (PWA)',
        value: 'pwa',
        short: 'PWA'
      },
      {
        name: 'Linter',
        value: 'linter',
        short: 'Linter'
      },
      {
        name: 'Unit Testing',
        value: 'unit',
        short: 'Unit'
      },
      {
        name: 'End-to-end Testing',
        value: 'e2e',
        short: 'E2E'
      }
    ]
  },
  {
    name: 'linter',
    when: hasFeature('linter'),
    type: 'list',
    message: 'Pick a linter solution:',
    choices: [
      {
        name: 'ESLint w/ only error-prevention rules',
        value: 'eslint-only',
        short: 'ESLint only'
      },
      {
        name: 'ESLint + Standard (https://github.com/standard/standard)',
        value: 'standard',
        short: 'Standard'
      },
      {
        name: 'ESLint + Airbnb (https://github.com/airbnb/javascript)',
        value: 'airbnb',
        short: 'Airbnb'
      },
      {
        name: 'ESLint + Prettier (https://prettier.io/)',
        value: 'prettier',
        short: 'Prettier'
      }
    ]
  },
  {
    name: 'unit',
    when: hasFeature('unit'),
    type: 'list',
    message: 'Pick a unit testing solution:',
    choices: [
      {
        name: 'Mocha (with better webpack integration, https://mochajs.org/)',
        value: 'mocha',
        short: 'Mocha'
      },
      {
        name: 'Jest (https://facebook.github.io/jest/)',
        value: 'jest',
        short: 'Jest'
      }
    ]
  },
  {
    name: 'e2e',
    when: hasFeature('e2e'),
    type: 'list',
    message: 'Pick an end-to-end testing solution:',
    choices: [
      {
        name: 'Nightwatch (Selenium-based, http://nightwatchjs.org/)',
        value: 'nightwatch',
        short: 'Nightwatch'
      },
      {
        name: 'Cypress (Chrome-only & interactive, https://www.cypress.io/)',
        value: 'cypress',
        short: 'Cypress'
      }
    ]
  },
  {
    name: 'packageManager',
    when: isMode('manual'),
    type: 'list',
    message: 'Automatically install NPM dependencies after project creation?',
    choices: [
      {
        name: 'Use NPM',
        value: 'npm',
        short: 'NPM'
      },
      {
        name: 'Use Yarn',
        value: 'yarn',
        short: 'Yarn'
      },
      {
        name: `I'll handle that myself`,
        value: 'no',
        short: 'No'
      }
    ]
  },
  {
    name: 'save',
    when: isMode('manual'),
    type: 'confirm',
    message: 'Save the preferences for future projects?'
  }
]).then(options => {
  console.log(options)
})
