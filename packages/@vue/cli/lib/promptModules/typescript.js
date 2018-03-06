const chalk = require('chalk')

module.exports = cli => {
  cli.injectFeature({
    name: 'TypeScript',
    value: 'ts',
    short: 'TS',
    description: 'Add support for the TypeScript language',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript',
    plugins: ['typescript']
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
  } else {
    cli.injectPrompt({
      name: 'useTsWithBabel',
      when: answers => answers.features.includes('ts'),
      type: 'confirm',
      message: 'Use Babel alongside TypeScript for auto-detected polyfills?'
    })
  }

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('ts')) {
      const tsOptions = {
        classComponent: answers.tsClassComponent
      }
      if (answers.eslintConfig === 'tslint') {
        tsOptions.tsLint = true
        tsOptions.lintOn = answers.lintOn
      }
      if (answers.useTsWithBabel) {
        tsOptions.useTsWithBabel = true
      } else if (answers.compileTsWithBabel) {
        tsOptions.experimentalCompileTsWithBabel = true
      }
      options.plugins['@vue/cli-plugin-typescript'] = tsOptions
    }
  })
}
