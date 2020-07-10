module.exports = cli => {
  cli.injectFeature({
    name: 'Choose Vue version',
    value: 'vueVersion',
    description: 'Choose a version of Vue.js that you want to start the project with',
    type: 'list',
    choices: [
      {
        name: '2.x',
        value: '2'
      },
      {
        name: '3.x (preview)',
        value: '3'
      }
    ],
    checked: true
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.vueVersion) {
      options.vueVersion = answers.vueVersion
    }
  })
}
