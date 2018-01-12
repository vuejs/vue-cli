module.exports = cli => {
  cli.onPromptComplete((answers, options) => {
    if (
      !answers.features.includes('ts') ||
      answers.useTsWithBabel ||
      answers.experimentalCompileTsWithBabel
    ) {
      options.plugins['@vue/cli-plugin-babel'] = {}
    }
  })
}
