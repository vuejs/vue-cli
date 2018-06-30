// This file will be loaded when the project is opened
module.exports = api => {
  if (!process.env.VUE_APP_CLI_UI_DEV) return

  console.log('has(eslint)', api.hasPlugin('eslint'))
  console.log('has(typescript)', api.hasPlugin('typescript'))

  // Add a test page below 'plugins', 'configurations' and 'tasks' on the left sidebar
  api.addView({
    id: 'org.vue.webpack.views.test',
    name: 'org.vue.webpack.routes.test',
    // icon: 'pets',
    icon: '/public/webpack-logo.png',
    tooltip: 'Test view from webpack addon'
  })

  // Shared data example to store a value (for example a setting)
  api.onProjectOpen(() => {
    api.setSharedData('test-data', api.storageGet('vue-cli.test-data'))
  })
  api.watchSharedData('test-data', value => {
    api.storageSet('vue-cli.test-data', value)
    console.log('test-data value saved')
  })

  // Test Plugin Action
  api.onAction('test-action', params => {
    console.log('test-action called', params)

    setTimeout(() => {
      api.callAction('other-action', { foo: 'bar' })
    }, 1000)

    return 'meow'
  })

  // Hooks
  api.onViewOpen(({ view }) => {
    console.log('onViewOpen', view.id)
  })
  api.onTaskOpen(({ task }) => {
    console.log('onTaskOpen', task.id)
  })
  api.onTaskRun(({ task }) => {
    console.log('onTaskRun', task.id)
  })
  api.onTaskExit(({ task }) => {
    console.log('onTaskExit', task.id)
  })
  api.onConfigRead(({ config }) => {
    console.log('onConfigRead', config.id)
  })
  api.onConfigWrite(({ config }) => {
    console.log('onConfigWrite', config.id)
  })
}
