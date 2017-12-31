module.exports = api => {
  api.chainWebpack(webpackConfig => {
    if (process.env.NODE_ENV === 'development') {
      const webpack = require('webpack')
      const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
      const WatchMissingNodeModulesPlugin = require('../util/WatchMissingNodeModulesPlugin')

      webpackConfig
        .devtool('cheap-module-eval-source-map')

      webpackConfig
        .plugin('hmr')
          .use(webpack.HotModuleReplacementPlugin)

      webpackConfig
        .plugin('named-modules')
          .use(webpack.NamedModulesPlugin)

      webpackConfig
        .plugin('no-emit-on-errors')
          .use(webpack.NoEmitOnErrorsPlugin)

      webpackConfig
        .plugin('firendly-errors')
          .use(FriendlyErrorsPlugin)

      webpackConfig
        .plugin('watch-missing')
          .use(WatchMissingNodeModulesPlugin, [api.resolve('node_modules')])
    }
  })
}
