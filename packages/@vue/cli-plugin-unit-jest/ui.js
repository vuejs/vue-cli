module.exports = api => {
  api.describeTask({
    match: /vue-cli-service test:unit/,
    description: 'org.vue.jest.tasks.test.description',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-jest#injected-commands',
    prompts: [
      {
        name: 'watch',
        type: 'confirm',
        description: 'org.vue.jest.tasks.test.watch'
      },
      {
        name: 'notify',
        type: 'confirm',
        description: 'org.vue.jest.tasks.test.notify',
        when: answers => answers.watch
      },
      {
        name: 'update',
        type: 'confirm',
        description: 'org.vue.jest.tasks.test.update'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.watch) args.push('--watch')
      if (answers.notify) args.push('--notify')
      if (answers.update) args.push('--updateSnapshot')
    }
  })
}
