module.exports = cli => {
  cli.injectFeature({
    name: 'Vuex',
    value: 'vuex'
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('vuex')) {
      options.vuex = true
    }
  })
}
