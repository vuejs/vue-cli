module.exports = cli => {
  cli.injectFeature({
    name: 'Progressive Web App (PWA) Support',
    value: 'pwa'
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('pwa')) {
      options.plugins['@vue/cli-plugin-pwa'] = {}
    }
  })
}
