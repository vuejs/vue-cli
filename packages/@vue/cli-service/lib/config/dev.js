module.exports = api => {
  api.chainWebpack(webpackConfig => {
    if (process.env.NODE_ENV === 'development') {
      webpackConfig
        .devtool('cheap-module-eval-source-map')
        .output
          .publicPath('/')

      webpackConfig
        .plugin('hmr')
          .use(require('webpack/lib/HotModuleReplacementPlugin'))

      webpackConfig
        .plugin('named-modules')
          .use(require('webpack/lib/NamedModulesPlugin'))

      webpackConfig
        .plugin('no-emit-on-errors')
          .use(require('webpack/lib/NoEmitOnErrorsPlugin'))

      // friendly error plugin displays very confusing errors when webpack
      // fails to resolve a loader, so we provide custom handlers to improve it
      const { transformer, formatter } = require('../webpack/resolveLoaderError')
      webpackConfig
        .plugin('firendly-errors')
          .use(require('friendly-errors-webpack-plugin'), [{
            additionalTransformers: [transformer],
            additionalFormatters: [formatter]
          }])

      webpackConfig
        .plugin('watch-missing')
          .use(
            require('../webpack/WatchMissingNodeModulesPlugin'),
            [api.resolve('node_modules')]
          )
    }
  })
}
