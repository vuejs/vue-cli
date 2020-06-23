const isWP5 = parseInt(require('webpack').version, 10) === 5

module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    if (process.env.NODE_ENV === 'production') {
      webpackConfig
        .mode('production')
        .devtool(options.productionSourceMap ? 'source-map' : false)

      // keep module.id stable when vendor modules does not change
      if (isWP5) {
        webpackConfig.optimization.moduleIds = 'hashed'
      } else {
        webpackConfig
          .plugin('hash-module-ids')
          .use(require('webpack/lib/HashedModuleIdsPlugin'), [{
            hashDigest: 'hex'
          }])
      }

      // disable optimization during tests to speed things up
      if (process.env.VUE_CLI_TEST) {
        webpackConfig.optimization.minimize(false)
      }
    }
  })
}
