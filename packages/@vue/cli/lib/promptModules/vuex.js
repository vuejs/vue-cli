module.exports = cli => {
  cli.injectFeature({
    name: 'Vuex',
    value: 'vuex',
    description: 'Manage the app state with a centralized store',
    link: 'https://vuex.vuejs.org/'
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('vuex')) {
      options.plugins['@vue/cli-plugin-vuex'] = {}
    }
  })
}
