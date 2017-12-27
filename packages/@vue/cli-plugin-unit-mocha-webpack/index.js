module.exports = api => {
  api.registerCommand('test', {
    description: 'run unit tests'
  }, args => {
    api.setEnv('test')
    require('./runner')(api.resolveWebpackConfig(), args)
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
