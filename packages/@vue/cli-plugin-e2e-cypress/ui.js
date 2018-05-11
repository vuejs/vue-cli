module.exports = api => {
  api.describeTask({
    match: /vue-cli-service test:e2e/,
    description: 'Run e2e tests with `cypress run`',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-cypress#injected-commands',
    prompts: [
      {
        name: 'headless',
        type: 'confirm',
        default: false,
        description: 'Run in headless mode without GUI'
      },
      {
        name: 'mode',
        type: 'list',
        default: 'development',
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
          }
        ],
        description: 'Specify the mode the dev server should run in'
      },
      {
        name: 'url',
        type: 'input',
        default: '',
        description: 'Run e2e tests against given url instead of auto-starting dev server'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.headless) args.push('--headless')
      if (answers.mode) args.push('--mode', answers.mode)
      if (answers.url) args.push('--url', answers.url)
    }
  })
}
