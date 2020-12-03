/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    if (process.env.NODE_ENV === 'production') {
      webpackConfig
        .mode('production')
        .devtool(options.productionSourceMap ? 'source-map' : false)

      const { semver } = require('@vue/cli-shared-utils')
      const webpack = require('webpack')
      const webpackMajor = semver.major(webpack.version)

      // DeterministicModuleIdsPlugin is only available in webpack 5
      // (and enabled by default in production mode).

      // In webpack 4, we need HashedModuleIdsPlugin
      // to keep module.id stable when vendor modules does not change.
      // It is "the second best solution for long term caching".
      // <https://github.com/webpack/webpack/pull/7399#discussion_r193970769>
      if (webpackMajor === 4) {
        webpackConfig.optimization.set('hashedModuleIds', true)
      }

      // disable optimization during tests to speed things up
      if (process.env.VUE_CLI_TEST) {
        webpackConfig.optimization.minimize(false)
      }
    }
  })
}
