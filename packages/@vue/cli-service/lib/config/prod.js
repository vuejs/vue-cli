module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    if (process.env.NODE_ENV === 'production') {
      webpackConfig
        .set('mode', 'production')

      webpackConfig
        .devtool('source-map')
        .output
          .filename(`js/[name].[chunkhash:8].js`)
          .chunkFilename(`js/[id].[chunkhash:8].js`)

      // keep module.id stable when vendor modules does not change
      webpackConfig
        .plugin('hash-module-ids')
          .use(require('webpack/lib/HashedModuleIdsPlugin'))

      // optimize CSS (dedupe)
      webpackConfig
        .plugin('optimize-css')
          .use(require('optimize-css-assets-webpack-plugin'), [{
            cssProcessorOptions: options.productionSourceMap && options.cssSourceMap
              ? { safe: true, map: { inline: false }}
              : { safe: true }
          }])

      // minify JS
      webpackConfig.optimization.set('minimizer', [{
        apply: compiler => {
          // disable during tests to speed things up
          if (process.env.VUE_CLI_TEST) {
            return
          }
          const UglifyPlugin = require('uglifyjs-webpack-plugin')
          const getUglifyOptions = require('./uglifyOptions')
          new UglifyPlugin(getUglifyOptions(options)).apply(compiler)
        }
      }])
    }
  })
}
