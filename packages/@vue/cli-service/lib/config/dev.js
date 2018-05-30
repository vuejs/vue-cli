module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    if (process.env.NODE_ENV === 'development') {
      webpackConfig
        .devtool('cheap-module-eval-source-map')
        .output
          .publicPath(options.baseUrl)

      webpackConfig
        .plugin('hmr')
          .use(require('webpack/lib/HotModuleReplacementPlugin'))

      webpackConfig
        .plugin('no-emit-on-errors')
          .use(require('webpack/lib/NoEmitOnErrorsPlugin'))

      if (!process.env.VUE_CLI_TEST && options.devServer.progress !== false) {
        webpackConfig
          .plugin('progress')
          .use(require('webpack/lib/ProgressPlugin'))
      }
    }
  })
}
