const {
  classComponent,
  useTsWithBabel
} = require('@vue/cli-shared-utils/lib/pluginPrompts/typescript')

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
    ...classComponent,
    name: 'tsClassComponent',
    when: answers => answers.features.includes('ts')
  })

  cli.injectPrompt({
    ...useTsWithBabel,
    when: answers => answers.features.includes('ts'),
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
