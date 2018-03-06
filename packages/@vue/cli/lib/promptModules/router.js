module.exports = cli => {
  cli.injectFeature({
    name: 'Router',
    value: 'router',
    description: 'Structure the app with dynamic pages',
    link: 'https://router.vuejs.org/'
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('router')) {
      options.router = true
    }
  })
}
