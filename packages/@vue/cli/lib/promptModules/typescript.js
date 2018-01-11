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
      options.plugins['@vue/cli-plugin-typescript'] = {
        classComponent: answers.tsClassComponent
      }
    }
  })
}
