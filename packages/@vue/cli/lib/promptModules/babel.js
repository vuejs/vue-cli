module.exports = cli => {
  cli.onPromptComplete((answers, options) => {
    if (!answers.features.includes('ts')) {
      options.plugins['@vue/cli-plugin-babel'] = {}
    }
  })
}
