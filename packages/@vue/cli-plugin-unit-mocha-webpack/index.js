module.exports = api => {
  api.registerCommand('test', (webpackConfig, args) => {
    require('./runner')(webpackConfig, args)
  })

  api.configureWebpack(webpackConfig => {
    if (process.env.NODE_ENV === 'test') {
      if (!webpackConfig.externals) {
        webpackConfig.externals = []
      }
      webpackConfig.externals = [].conact(
        webpackConfig.externals,
        require('webpack-node-externals')()
      )
      webpackConfig.devtool = 'inline-cheap-module-source-map'
    }
  })
}
