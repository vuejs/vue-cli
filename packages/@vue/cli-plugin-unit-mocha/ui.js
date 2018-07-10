module.exports = api => {
  api.describeTask({
    match: /vue-cli-service test:unit/,
    description: 'org.vue.mocha.tasks.test.description',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-mocha#injected-commands',
    prompts: [
      {
        name: 'watch',
        type: 'confirm',
        default: false,
        description: 'org.vue.mocha.tasks.test.watch'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.watch) args.push('--watch')
    }
  })
}
