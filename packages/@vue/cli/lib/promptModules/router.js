const chalk = require('chalk')

module.exports = cli => {
  cli.injectFeature({
    name: 'Router',
    value: 'router',
    description: 'Structure the app with dynamic pages',
    link: 'https://router.vuejs.org/'
  })

  cli.injectPrompt({
    name: 'routerHistoryMode',
    when: answers => answers.features.includes('router'),
    type: 'confirm',
    message: `Use history mode for router? ${chalk.yellow(`(Requires proper server setup for index fallback in production)`)}`,
    description: `By using the HTML5 History API, the URLs don't need the '#' character anymore.`,
    link: 'https://router.vuejs.org/guide/essentials/history-mode.html'
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('router')) {
      options.router = true
      options.routerHistoryMode = answers.routerHistoryMode
    }
  })
}
