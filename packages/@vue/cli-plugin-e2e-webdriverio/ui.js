module.exports = api => {
  api.describeTask({
    match: /vue-cli-service test:e2e/,
    description: 'org.vue.webdriverio.tasks.test.description',
    link: 'https://github.com/vuejs/vue-cli',
    prompts: [],
    onBeforeRun: () => {}
  })
}
