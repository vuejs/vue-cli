module.exports = cli => {
  cli.injectFeature({
    name: 'Linter',
    value: 'eslint',
    short: 'Linter'
  })

  cli.injectPrompt({
    name: 'eslintConfig',
    when: answers => answers.features.includes('eslint'),
    type: 'list',
    message: 'Pick a lint config:',
    choices: [
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
    message: 'Pick a lint mode:',
    when: answers => answers.features.includes('eslint'),
    type: 'list',
    choices: [
      {
        name: 'Lint + fix on save',
        value: 'save'
      },
      {
        name: 'Lint + fix on commit',
        value: 'commit'
      },
      {
        name: 'Manually run npm script',
        value: false
      }
    ]
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('eslint')) {
      options.plugins['@vue/cli-plugin-eslint'] = {
        config: answers.eslintConfig,
        lintOn: answers.lintOn
      }
    }
  })
}
