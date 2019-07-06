const chalk = require('chalk')
const { hasGit } = require('../../')

exports.lintOn = {
  name: 'lintOn',
  message: 'Pick additional lint features:',
  type: 'checkbox',
  choices: [
    {
      name: 'Lint on save',
      value: 'save',
      checked: true
    },
    {
      name: 'Lint and fix on commit' + (hasGit() ? '' : chalk.red(' (requires Git)')),
      value: 'commit'
    }
  ]
}

exports.eslintConfig = {
  name: 'config',
  type: 'list',
  message: `Pick an ESLint config:`,
  description: 'Checking code errors and enforcing an homogeoneous code style is recommended.',
  choices: [
    {
      name: 'Error prevention only',
      value: 'base',
      short: 'Basic'
    },
    {
      name: 'Airbnb',
      value: 'airbnb',
      short: 'Airbnb'
    },
    {
      name: 'Standard',
      value: 'standard',
      short: 'Standard'
    },
    {
      name: 'Prettier',
      value: 'prettier',
      short: 'Prettier'
    }
  ]
}
