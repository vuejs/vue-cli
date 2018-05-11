module.exports = cli => {
  cli.injectFeature({
    name: 'Babel',
    value: 'babel',
    short: 'Babel',
    checked: true
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('ts')) {
      if (!answers.useTsWithBabel && !answers.experimentalCompileTsWithBabel) {
        return
      }
    } else {
      if (!answers.features.includes('babel')) {
        return
      }
    }
    options.plugins['@vue/cli-plugin-babel'] = {}
  })
}
