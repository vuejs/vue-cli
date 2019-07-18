module.exports = cli => {
  const {
    historyMode
  } = require('@vue/cli-shared-utils/lib/pluginPrompts/router')

  const featureName = 'Router'

  cli.injectFeature({
    name: featureName,
    value: 'router',
    description: 'Structure the app with dynamic pages',
    link: 'https://router.vuejs.org/'
  })

  cli.injectPrompt({
    ...historyMode,
    group: featureName,
    when: answers => answers.features.includes('router')
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('router')) {
      options.plugins['@vue/cli-plugin-router'] = {
        historyMode: answers.historyMode
      }
    }
  })
}
