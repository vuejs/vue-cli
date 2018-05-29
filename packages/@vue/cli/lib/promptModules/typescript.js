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
    message: 'Use class-style component syntax?',
    default: true
  })

  cli.injectPrompt({
    name: 'useTsWithBabel',
    when: answers => answers.features.includes('ts'),
    type: 'confirm',
    message: 'Use Babel alongside TypeScript for auto-detected polyfills?',
    default: answers => answers.features.includes('babel')
  })

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
      }
      options.plugins['@vue/cli-plugin-typescript'] = tsOptions
    }
  })
}
