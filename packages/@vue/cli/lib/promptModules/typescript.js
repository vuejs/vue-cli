module.exports = cli => {
  cli.injectFeature({
    name: 'TypeScript',
    value: 'ts',
    short: 'TS'
  })

  cli.injectPrompt({
    name: 'tsClassComponent',
    when: answers => answers.features.includes('ts'),
    type: 'confirm',
    message: 'Use class-style component syntax?'
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('ts')) {
      const tsOptions = {
        classComponent: answers.tsClassComponent
      }
      if (answers.features.includes('linter')) {
        tsOptions.lint = true
        tsOptions.lintOn = answers.lintOn
      }
      options.plugins['@vue/cli-plugin-typescript'] = tsOptions
    }
  })
}
