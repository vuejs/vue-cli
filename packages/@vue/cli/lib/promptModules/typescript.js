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
    description: 'Use the @Component decorator on classes.',
    link: 'https://vuejs.org/v2/guide/typescript.html#Class-Style-Vue-Components',
    default: answers => answers.vueVersion !== '3'
  })

  cli.injectPrompt({
    name: 'useTsWithBabel',
    when: answers => answers.features.includes('ts'),
    type: 'confirm',
    message: 'Use Babel alongside TypeScript (required for modern mode, auto-detected polyfills, transpiling JSX)?',
    description: 'It will output ES2015 and delegate the rest to Babel for auto polyfill based on browser targets.',
    default: answers => answers.features.includes('babel')
  })

  cli.injectPrompt({
    name: 'useTsWithBabelOnlyMode',
    when: answers => answers.features.includes('ts') && answers.useTsWithBabel,
    type: 'confirm',
    message: 'Use Babel TypeScript toolchains?',
    description: 'Use Babel TypeScript toolchains.',
    default: false
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('ts')) {
      const tsOptions = {
        classComponent: answers.tsClassComponent
      }
      if (answers.useTsWithBabel) {
        tsOptions.useTsWithBabel = true
      }
      if (answers.useTsWithBabelOnlyMode) {
        tsOptions.useTsWithBabelOnlyMode = true
      }
      options.plugins['@vue/cli-plugin-typescript'] = tsOptions
    }
  })
}
