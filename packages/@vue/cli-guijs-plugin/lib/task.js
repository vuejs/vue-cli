module.exports = api => {
  // vue inspect
  api.addTask({
    name: 'inspect',
    command: 'vue-cli-service inspect',
    description: 'org.vue.vue-webpack.tasks.inspect.description',
    link: 'https://cli.vuejs.org/guide/webpack.html#inspecting-the-project-s-webpack-config',
    icon: '/public/webpack-inspect-logo.png',
    prompts: [
      {
        name: 'mode',
        type: 'list',
        default: 'production',
        choices: [
          {
            name: 'development',
            value: 'development'
          },
          {
            name: 'production',
            value: 'production'
          },
          {
            name: 'test',
            value: 'test'
          },
          {
            name: '(unset)',
            value: ''
          }
        ],
        description: 'org.vue.vue-webpack.tasks.inspect.mode'
      },
      {
        name: 'verbose',
        type: 'confirm',
        default: false,
        description: 'org.vue.vue-webpack.tasks.inspect.verbose'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.mode) args.push('--mode', answers.mode)
      if (answers.verbose) args.push('--verbose')
    }
  })
}
