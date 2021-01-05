const { chalk } = require('@vue/cli-shared-utils')

module.exports = cli => {
  cli.injectFeature({
    name: 'Router',
    value: 'router',
    description: 'Structure the app with dynamic pages',
    link: 'https://router.vuejs.org/'
  })

  cli.injectPrompt({
    name: 'historyMode',
    when: answers => answers.features.includes('router'),
    type: 'confirm',
    message: `Use history mode for router? ${chalk.yellow(`(Requires proper server setup for index fallback in production)`)}`,
    description: `By using the HTML5 History API, the URLs don't need the '#' character anymore.`,
    link: 'https://router.vuejs.org/guide/essentials/history-mode.html'
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('router')) {
      options.plugins['@vue/cli-plugin-router'] = {
        historyMode: answers.historyMode
      }
    }
  })
}
