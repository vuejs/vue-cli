module.exports = cli => {
  const chalk = require('chalk')
  const { hasGit } = require('@vue/cli-shared-utils')

  cli.injectFeature({
    name: 'Linter / Formatter',
    value: 'linter',
    short: 'Linter',
    checked: true
  })

  cli.injectPrompt({
    name: 'eslintConfig',
    when: answers => answers.features.includes('linter'),
    type: 'list',
    message: 'Pick a linter / formatter config:',
    choices: answers => [
      ...(
        answers.features.includes('ts')
          ? [{
            name: `TSLint`,
            value: 'tslint',
            short: 'TSLint'
          }]
          : []
      ),
      {
        name: 'ESLint with error prevention only',
        value: 'base',
        short: 'Basic'
      },
      {
        name: 'ESLint + Airbnb config',
        value: 'airbnb',
        short: 'Airbnb'
      },
      {
        name: 'ESLint + Standard config',
        value: 'standard',
        short: 'Standard'
      },
      {
        name: 'ESLint + Prettier',
        value: 'prettier',
        short: 'Prettier'
      }
    ]
  })

  cli.injectPrompt({
    name: 'lintOn',
    message: 'Pick additional lint features:',
    when: answers => answers.features.includes('linter'),
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
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('linter') && answers.eslintConfig !== 'tslint') {
      options.plugins['@vue/cli-plugin-eslint'] = {
        config: answers.eslintConfig,
        lintOn: answers.lintOn
      }
    }
  })
}
