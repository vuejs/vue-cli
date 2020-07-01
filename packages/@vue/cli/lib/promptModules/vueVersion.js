module.exports = cli => {
  cli.injectPrompt({
    name: 'vueVersion',
    type: 'list',
    message: `Choose a version of Vue.js that you want to start the project with`,
    choices: [
      {
        name: '2.x',
        value: '2'
      },
      {
        name: '3.x (preview)',
        value: '3'
      }
    ]
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.vueVersion) {
      options.vueVersion = answers.vueVersion
    }
  })
}
