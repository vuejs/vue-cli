// This file will be loaded when the project is opened
module.exports = api => {
  if (process.env.NODE_ENV === 'production') return

  // Add dynamic components in dev mode (webpack dashboard & analyzer)
  api.addClientAddon({
    id: 'vue-webpack',
    url: 'http://localhost:8042/index.js'
  })

  // Add a test page below 'plugins', 'configurations' and 'tasks' on the left sidebar
  api.addView({
    id: 'vue-webpack-test-view',
    name: 'test-webpack-route',
    icon: 'pets',
    // icon: 'http://localhost:4000/_plugin/%40vue%2Fcli-service/webpack-icon.svg',
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
}
