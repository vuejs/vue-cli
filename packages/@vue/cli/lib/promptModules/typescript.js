const chalk = require('chalk')

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

  if (process.env.VUE_CLI_EXPERIMENTAL) {
    cli.injectPrompt({
      name: 'compileTsWithBabel',
      when: answers => answers.features.includes('ts'),
      type: 'confirm',
      message: `Compile TS with babel? ${chalk.yellow(`(experimental)`)}`
    })
  }

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('ts')) {
      const tsOptions = {
        classComponent: answers.tsClassComponent
      }
      if (answers.features.includes('linter')) {
        tsOptions.lint = true
        tsOptions.lintOn = answers.lintOn
      }
      if (answers.compileTsWithBabel) {
        tsOptions.experimentalCompileTsWithBabel = true
      }
      options.plugins['@vue/cli-plugin-typescript'] = tsOptions
    }
  })
}
