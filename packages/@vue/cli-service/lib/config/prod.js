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
          .use(require('optimize-css-assets-webpack-plugin'), [
            options.productionSourceMap && options.cssSourceMap
              ? { safe: true, map: { inline: false }}
              : { safe: true }
          ])

      // minify JS
      // disable during tests to speed things up
      if (!process.env.VUE_CLI_TEST) {
        webpackConfig
          .plugin('uglifyjs')
            .use(require('uglifyjs-webpack-plugin'), [{
              uglifyOptions: {
                compress: {
                  warnings: false
                }
              },
              sourceMap: options.productionSourceMap,
              parallel: true
            }])
      }

      // Chunk splits
      const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')

      // extract vendor libs into its own chunk for better caching, since they
      // are more likely to stay the same.
      webpackConfig
        .plugin('split-vendor')
          .use(CommonsChunkPlugin, [{
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
          .use(CommonsChunkPlugin, [{
            name: 'manifest',
            minChunks: Infinity
          }])

      // inline the manifest chunk into HTML
      webpackConfig
        .plugin('inline-manifest')
          .use(require('../webpack/InlineSourcePlugin'), [{
            include: /manifest\..*\.js$/
          }])

      // since manifest is inlined, don't preload it anymore
      webpackConfig
        .plugin('preload')
          .tap(([options]) => {
            options.fileBlacklist.push(/manifest\..*\.js$/)
            return [options]
          })

      // This instance extracts shared chunks from code splitted chunks and bundles them
      // in a separate chunk, similar to the vendor chunk
      // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
      webpackConfig
        .plugin('split-vendor-async')
          .use(CommonsChunkPlugin, [{
            name: 'app',
            async: 'vendor-async',
            children: true,
            minChunks: 3
          }])

      // copy static assets in public/
      webpackConfig
        .plugin('copy')
          .use(require('copy-webpack-plugin'), [[{
            from: api.resolve('public'),
            to: api.resolve(options.outputDir),
            ignore: ['index.html', '.*']
          }]])

      // TODO investigate DLL plugin options
    }
  })
}
