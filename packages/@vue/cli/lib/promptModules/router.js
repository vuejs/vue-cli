module.exports = cli => {
  cli.injectFeature({
    name: 'Router',
    value: 'router'
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('router')) {
      options.router = true
    }
  })
}
