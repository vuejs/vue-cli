module.exports = api => {
  api.registerCommand('test', {
    description: 'run unit tests with mocha-webpack'
  }, args => {
    api.setMode('test')
    // for @vue/babel-preset-app
    process.env.VUE_CLI_BABEL_TARGET_NODE = true
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
