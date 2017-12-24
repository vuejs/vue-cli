module.exports = service => {
  service.reigsterScript('test', { env: 'test' }, (webpackConfig, args) => {
    require('./runner')(webpackConfig, args)
  })

  service.configureWebpack({ env: 'test' }, webpackConfig => {
    require('jsdom-global')()
    if (!webpackConfig.externals) {
      webpackConfig.externals = []
    }
    webpackConfig.externals.push(require('webpack-node-externals')())
    webpackConfig.devtool = 'inline-cheap-module-source-map'
  })
}
