module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    if (process.env.NODE_ENV === 'production') {
      const webpack = require('webpack')
      const CopyPlugin = require('copy-webpack-plugin')
      const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
      const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

      webpackConfig
        .devtool('source-map')
        .output
          .filename(`${options.staticDir}/js/[name].[chunkhash:8].js`)
          .chunkFilename(`${options.staticDir}/js/[id].[chunkhash:8].js`)

      // keep module.id stable when vendor modules does not change
      webpackConfig
        .plugin('hash-module-ids')
          .use(webpack.HashedModuleIdsPlugin)

      // enable scope hoisting / tree shaking
      webpackConfig
        .plugin('module-concatenation')
          .use(webpack.optimize.ModuleConcatenationPlugin)

      // minify HTML
      webpackConfig
        .plugin('html')
          .tap(([options]) => [Object.assign(options, {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true
              // more options:
              // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
          })])

      // optimize CSS (dedupe)
      webpackConfig
        .plugin('optimize-css')
          .use(OptimizeCSSPlugin, [
            options.productionSourceMap && options.cssSourceMap
              ? { safe: true, map: { inline: false }}
              : { safe: true }
          ])

      // minify JS
      webpackConfig
        .plugin('uglifyjs')
          .use(UglifyJSPlugin, [{
            uglifyOptions: {
              compress: {
                warnings: false
              }
            },
            sourceMap: options.productionSourceMap,
            parallel: true
          }])

      // extract vendor libs into its own chunk for better caching, since they
      // are more likely to stay the same.
      webpackConfig
        .plugin('split-vendor')
          .use(webpack.optimize.CommonsChunkPlugin, [{
            name: 'vendor',
            minChunks (module) {
              // any required modules inside node_modules are extracted to vendor
              return (
                module.resource &&
                /\.js$/.test(module.resource) &&
                module.resource.indexOf(`node_modules`) > -1
              )
            }
          }])

      // extract webpack runtime and module manifest to its own file in order to
      // prevent vendor hash from being updated whenever app bundle is updated
      webpackConfig
        .plugin('split-manifest')
          .use(webpack.optimize.CommonsChunkPlugin, [{
            name: 'manifest',
            minChunks: Infinity
          }])

      // This instance extracts shared chunks from code splitted chunks and bundles them
      // in a separate chunk, similar to the vendor chunk
      // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
      webpackConfig
        .plugin('split-vendor-async')
          .use(webpack.optimize.CommonsChunkPlugin, [{
            name: 'app',
            async: 'vendor-async',
            children: true,
            minChunks: 3
          }])

      // copy static assets in public/
      webpackConfig
        .plugin('copy')
          .use(CopyPlugin, [[{
            from: api.resolve('public'),
            to: api.resolve(options.outputDir),
            ignore: ['index.html', '.*']
          }]])

      // TODO investigate DLL plugin options
    }
  })
}
