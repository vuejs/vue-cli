// these prompts are used if the plugin is late-installed into an existing
// project and invoked by `vue invoke`.

const { chalk } = require('@vue/cli-shared-utils')

module.exports = [
  {
    name: 'type',
    type: 'list',
    message: 'What do you want to generate?',
    choices: [
      {
        name: 'Initial setup',
        value: 'init'
      }
      // TODO: Component
      // TODO: View
    ]
  },
  {
    when: answers => answers.type === 'init',
    name: 'historyMode',
    type: 'confirm',
    message: `Use history mode for router? ${chalk.yellow(`(Requires proper server setup for index fallback in production)`)}`,
    description: `By using the HTML5 History API, the URLs don't need the '#' character anymore.`
  },
  {
    when: answers => answers.type === 'init',
    name: 'bare',
    type: 'confirm',
    message: 'Setup without any default routes, components and views?'
  }
]
