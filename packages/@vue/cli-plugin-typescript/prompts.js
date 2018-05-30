// these prompts are used if the plugin is late-installed into an existing
// project and invoked by `vue invoke`.

const { chalk, hasGit } = require('@vue/cli-shared-utils')

module.exports = [
  {
    name: `classComponent`,
    type: `confirm`,
    message: `Use class-style component syntax?`,
    default: true
  },
  {
    name: `useTsWithBabel`,
    type: `confirm`,
    message: `Use Babel alongside TypeScript for auto-detected polyfills?`
  },
  {
    name: `lint`,
    type: `confirm`,
    message: `Use TSLint?`
  },
  {
    name: `lintOn`,
    type: `checkbox`,
    when: answers => answers.lint,
    message: `Pick lint features:`,
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
]
