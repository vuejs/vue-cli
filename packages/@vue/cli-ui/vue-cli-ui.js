module.exports = api => {
  api.addClientAddon({
    id: 'vue-webpack',
    url: 'http://localhost:8042/index.js'
  })

  api.addView({
    id: 'vue-webpack-test-view',
    name: 'test-webpack-route',
    icon: 'pets',
    // icon: 'http://localhost:4000/_plugin/%40vue%2Fcli-service/webpack-icon.svg',
    tooltip: 'Test view from webpack addon'
  })

  api.onAction('test-action', params => {
    console.log('test-action called', params)

    setTimeout(() => {
      api.callAction('other-action', { foo: 'bar' })
    }, 1000)
  })
}
