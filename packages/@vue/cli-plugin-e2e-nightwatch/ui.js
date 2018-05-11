module.exports = api => {
  api.describeTask({
    match: /vue-cli-service test:e2e/,
    description: 'nightwatch.tasks.test.description',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-nightwatch#injected-commands',
    prompts: [
      {
        name: 'url',
        type: 'input',
        default: '',
        description: 'nightwatch.tasks.test.url'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.url) args.push('--url', answers.url)
    }
  })
}
