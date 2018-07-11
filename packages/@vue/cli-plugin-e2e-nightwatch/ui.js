module.exports = api => {
  api.describeTask({
    match: /vue-cli-service test:e2e/,
    description: 'org.vue.nightwatch.tasks.test.description',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-nightwatch#injected-commands',
    prompts: [
      {
        name: 'url',
        type: 'input',
        default: '',
        description: 'org.vue.nightwatch.tasks.test.url'
      }, {
        name: 'config',
        type: 'input',
        default: '',
        description: 'org.vue.nightwatch.tasks.test.config'
      }, {
        name: 'env',
        type: 'input',
        default: 'chrome',
        description: 'org.vue.nightwatch.tasks.test.env'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.url) args.push('--url', answers.url)
      if (answers.config) args.push('--config', answers.config)
      if (answers.env) args.push('--env', answers.env)
    }
  })
}
