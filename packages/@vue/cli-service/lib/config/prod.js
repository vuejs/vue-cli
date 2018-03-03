module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    if (process.env.NODE_ENV === 'production') {
      webpackConfig
        .devtool('source-map')
        .output
          .filename(`js/[name].[chunkhash:8].js`)
          .chunkFilename(`js/[id].[chunkhash:8].js`)

      // keep module.id stable when vendor modules does not change
      webpackConfig
        .plugin('hash-module-ids')
          .use(require('webpack/lib/HashedModuleIdsPlugin'))

      // enable scope hoisting / tree shaking
      webpackConfig
        .plugin('module-concatenation')
          .use(require('webpack/lib/optimize/ModuleConcatenationPlugin'))

      // optimize CSS (dedupe)
      webpackConfig
        .plugin('optimize-css')
          .use(require('optimize-css-assets-webpack-plugin'), [{
            cssProcessorOptions: options.productionSourceMap && options.cssSourceMap
              ? { safe: true, map: { inline: false }}
              : { safe: true }
          }])

      // minify JS
      const UglifyPlugin = require('uglifyjs-webpack-plugin')
      const getUglifyOptions = require('./uglifyOptions')
      // disable during tests to speed things up
      if (!process.env.VUE_CLI_TEST) {
        webpackConfig
          .plugin('uglify')
            .use(UglifyPlugin, [getUglifyOptions(options)])
      }
    }
  })
}
